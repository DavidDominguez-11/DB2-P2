from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from typing import Any
from pydantic import BaseModel

from core.database import get_db
from crud.nodes import node_to_dict, prepare_properties
from models.labels import PRIMARY_LABELS, ID_FIELD_MAP, NodeLabel
from schemas.generic import GenericResponse

router = APIRouter(prefix="/nodes", tags=["nodes"])


class CreateNodeRequest(BaseModel):
    labels: list[str]
    properties: dict[str, Any]


class UpdateLabelsRequest(BaseModel):
    add: list[str] = []
    remove: list[str] = []


def _find_id_field(labels: list[str], properties: dict) -> tuple[str, Any] | None:
    for label in labels:
        if label in PRIMARY_LABELS:
            field = ID_FIELD_MAP.get(NodeLabel(label))
            if field and field in properties:
                return field, properties[field]
    for key in properties:
        if key.endswith("_id") and properties[key]:
            return key, properties[key]
    if "id" in properties:
        return "id", properties["id"]
    return None


def _coerce(value: str) -> Any:
    """Convierte el string de filtro al tipo Python más apropiado."""
    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False
    try:
        return int(value)
    except ValueError:
        pass
    try:
        return float(value)
    except ValueError:
        pass
    return value


def _build_condition(field: str, op: str, param: str) -> str:
    """Devuelve la cláusula Cypher para un filtro individual."""
    ops = {
        "eq":          f"n.{field} = ${param}",
        "ne":          f"n.{field} <> ${param}",
        "gt":          f"n.{field} > ${param}",
        "gte":         f"n.{field} >= ${param}",
        "lt":          f"n.{field} < ${param}",
        "lte":         f"n.{field} <= ${param}",
        "contains":    f"toLower(toString(n.{field})) CONTAINS toLower(${param})",
        "starts_with": f"toLower(toString(n.{field})) STARTS WITH toLower(${param})",
        "ends_with":   f"toLower(toString(n.{field})) ENDS WITH toLower(${param})",
        "exists":      f"n.{field} IS NOT NULL",
        "not_exists":  f"n.{field} IS NULL",
    }
    return ops.get(op, f"n.{field} = ${param}")


# ── Búsqueda genérica con filtros ────────────────────────────────────────────

@router.get("/search")
async def search_nodes(
    label: str = Query(..., description="Label del nodo (User, Song, etc.)"),
    filter_field: list[str] = Query(default=[], description="Campo a filtrar"),
    filter_op:    list[str] = Query(default=[], description="Operador: eq|ne|gt|gte|lt|lte|contains|starts_with|ends_with|exists|not_exists"),
    filter_value: list[str] = Query(default=[], description="Valor del filtro"),
    skip:  int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    params: dict[str, Any] = {"skip": skip, "limit": limit}
    conditions: list[str] = []

    for i, (field, op, value) in enumerate(zip(filter_field, filter_op, filter_value)):
        param_key = f"fv_{i}"
        conditions.append(_build_condition(field, op, param_key))
        # exists / not_exists no necesitan valor
        if op not in ("exists", "not_exists"):
            params[param_key] = _coerce(value)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    query = f"MATCH (n:{label}) {where} RETURN n SKIP $skip LIMIT $limit"

    result = await db.run(query, **params)
    nodes = [node_to_dict(r["n"]) async for r in result]
    return {
        "label": label,
        "filters_applied": len(conditions),
        "skip": skip,
        "limit": limit,
        "nodes": nodes,
    }


# ── CRUD multi-label ──────────────────────────────────────────────────────────

@router.post("/", response_model=GenericResponse)
async def create_multi_label_node(
    body: CreateNodeRequest,
    db: AsyncSession = Depends(get_db),
):
    if not body.labels:
        raise HTTPException(status_code=400, detail="Se requiere al menos un label")
    if not body.properties:
        raise HTTPException(status_code=400, detail="Se requieren propiedades")

    id_info = _find_id_field(body.labels, body.properties)
    if not id_info:
        raise HTTPException(
            status_code=400,
            detail="No se encontró campo ID. Incluye una propiedad que termine en '_id' o llámala 'id'",
        )

    id_field, id_value = id_info
    primary_label = body.labels[0]
    extra_labels = body.labels[1:]

    clean_props = {k: v for k, v in body.properties.items() if not k.startswith("is_")}
    prepared = prepare_properties(clean_props)

    extra_clause = "".join(f" SET n:{lbl}" for lbl in extra_labels)
    query = (
        f"MERGE (n:{primary_label} {{{id_field}: $id_value}})"
        f"{extra_clause}"
        f" SET n += $props RETURN n"
    )

    try:
        result = await db.run(query, id_value=id_value, props=prepared)
        record = await result.single()
        if not record:
            raise HTTPException(status_code=500, detail="No se pudo crear el nodo")
        return GenericResponse(
            success=True,
            message=f"Nodo creado con labels {body.labels}",
            data=node_to_dict(record["n"]),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{element_id}/labels")
async def get_node_labels(
    element_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = "MATCH (n) WHERE elementId(n) = $eid RETURN labels(n) AS labels"
    result = await db.run(query, eid=element_id)
    record = await result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    return {"element_id": element_id, "labels": list(record["labels"])}


@router.patch("/{element_id}/labels", response_model=GenericResponse)
async def update_node_labels(
    element_id: str,
    body: UpdateLabelsRequest,
    db: AsyncSession = Depends(get_db),
):
    check = await db.run("MATCH (n) WHERE elementId(n) = $eid RETURN n", eid=element_id)
    if not await check.single():
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    if body.add:
        add_clause = " SET " + ", ".join(f"n:{lbl}" for lbl in body.add)
        await db.run(f"MATCH (n) WHERE elementId(n) = $eid{add_clause}", eid=element_id)

    if body.remove:
        remove_clause = " REMOVE " + ", ".join(f"n:{lbl}" for lbl in body.remove)
        await db.run(f"MATCH (n) WHERE elementId(n) = $eid{remove_clause}", eid=element_id)

    result = await db.run("MATCH (n) WHERE elementId(n) = $eid RETURN n", eid=element_id)
    record = await result.single()
    return GenericResponse(
        success=True,
        message="Labels actualizados",
        data=node_to_dict(record["n"]),
    )


@router.get("/{element_id}")
async def get_node_by_element_id(
    element_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = "MATCH (n) WHERE elementId(n) = $eid RETURN n"
    result = await db.run(query, eid=element_id)
    record = await result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    return node_to_dict(record["n"])

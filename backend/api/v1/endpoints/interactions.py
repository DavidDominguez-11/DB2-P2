from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.relationships import (
    create_relationship, get_relationship, get_relationships_by_type,
    update_relationship_properties, remove_relationship_properties,
    delete_relationship,
)
from crud.bulk_ops import (
    bulk_update_relationships, bulk_remove_relationship_property,
    bulk_delete_relationships,
)
from schemas.bulk import (
    CreateRelationshipRequest, UpdateRelationshipRequest,
    RemoveRelationshipPropertiesRequest,
    BulkUpdateRelationshipsRequest, BulkRemoveRelPropertyRequest,
    BulkDeleteRelationshipsRequest,
)
from schemas.generic import GenericResponse, AffectedResponse

router = APIRouter(prefix="/interactions", tags=["interactions"])


# ── Rutas fijas (deben ir ANTES de las rutas con parámetros) ─────────────────

@router.post("/", response_model=GenericResponse)
async def create_interaction(
    body: CreateRelationshipRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await create_relationship(
            db,
            body.from_label, body.from_id,
            body.to_label, body.to_id,
            body.rel_type, body.properties,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Uno o ambos nodos no existen")
        return GenericResponse(success=True, message="Relacion creada", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/by-type")
async def list_interactions_by_type(
    rel_type: str = Query(...),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await get_relationships_by_type(db, rel_type, limit=limit)
        return {"rel_type": rel_type, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/bulk/update", response_model=AffectedResponse)
async def bulk_update_interactions(
    body: BulkUpdateRelationshipsRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_update_relationships(
            db, body.rel_type,
            body.filter_property, body.filter_value,
            body.update_data,
        )
        return AffectedResponse(success=True, affected=count, message="Relaciones actualizadas")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/bulk/properties", response_model=AffectedResponse)
async def bulk_remove_interaction_property(
    body: BulkRemoveRelPropertyRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_remove_relationship_property(
            db, body.rel_type, body.property_to_remove,
            body.filter_property, body.filter_value,
        )
        return AffectedResponse(success=True, affected=count, message="Propiedad eliminada en masa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/bulk/delete", response_model=AffectedResponse)
async def bulk_delete_interactions(
    body: BulkDeleteRelationshipsRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_delete_relationships(
            db, body.rel_type,
            body.filter_property, body.filter_value,
        )
        return AffectedResponse(success=True, affected=count, message="Relaciones eliminadas")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Rutas con parámetros (deben ir DESPUÉS de las rutas fijas) ───────────────

@router.get("/{element_id}")
async def get_interaction(element_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_relationship(db, element_id)
    if not result:
        raise HTTPException(status_code=404, detail="Relacion no encontrada")
    return result


@router.patch("/{element_id}", response_model=GenericResponse)
async def update_interaction(
    element_id: str,
    body: UpdateRelationshipRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await update_relationship_properties(db, element_id, body.properties)
    if not result:
        raise HTTPException(status_code=404, detail="Relacion no encontrada")
    return GenericResponse(success=True, message="Relacion actualizada", data=result)


@router.delete("/{element_id}/properties", response_model=GenericResponse)
async def remove_interaction_properties(
    element_id: str,
    body: RemoveRelationshipPropertiesRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await remove_relationship_properties(db, element_id, body.property_names)
    if not result:
        raise HTTPException(status_code=404, detail="Relacion no encontrada")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{element_id}", response_model=GenericResponse)
async def delete_interaction(element_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_relationship(db, element_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Relacion no encontrada")
    return GenericResponse(success=True, message="Relacion eliminada")

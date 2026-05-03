from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from neo4j import AsyncSession
from core.database import get_db
from crud.bulk_ops import (
    bulk_update_nodes, bulk_remove_node_property, bulk_delete_nodes,
)
from services.maintenance import (
    check_graph_connectivity, get_graph_stats,
    load_nodes_from_csv, create_constraints,
)
from schemas.bulk import (
    BulkUpdateNodesRequest, BulkRemoveNodePropertyRequest,
    BulkDeleteNodesRequest,
)
from schemas.generic import GenericResponse, AffectedResponse

router = APIRouter(prefix="/bulk", tags=["bulk"])


@router.patch("/nodes", response_model=AffectedResponse)
async def bulk_update_nodes_endpoint(
    body: BulkUpdateNodesRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_update_nodes(
            db, body.label,
            body.filter_property, body.filter_value,
            body.update_data,
        )
        return AffectedResponse(success=True, affected=count, message="Nodos actualizados en masa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/nodes/properties", response_model=AffectedResponse)
async def bulk_remove_node_property_endpoint(
    body: BulkRemoveNodePropertyRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_remove_node_property(
            db, body.label, body.property_to_remove,
            body.filter_property, body.filter_value,
        )
        return AffectedResponse(success=True, affected=count, message="Propiedad eliminada en masa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/nodes", response_model=AffectedResponse)
async def bulk_delete_nodes_endpoint(
    body: BulkDeleteNodesRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await bulk_delete_nodes(
            db, body.label,
            body.filter_property, body.filter_value,
        )
        return AffectedResponse(success=True, affected=count, message="Nodos eliminados en masa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/csv/{label}", response_model=GenericResponse)
async def upload_csv(
    label: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Carga nodos desde un archivo CSV para el label indicado.
    El archivo debe tener encabezados que coincidan con las propiedades del label.
    Usa MERGE internamente, por lo que es seguro ejecutar multiples veces.
    """
    content = await file.read()
    try:
        result = await load_nodes_from_csv(db, label, content.decode("utf-8"))
        return GenericResponse(
            success=True,
            message=f"CSV procesado: {result['processed']} nodos, {result['errors_count']} errores",
            data=result,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/maintenance/connectivity", response_model=GenericResponse)
async def connectivity_check(db: AsyncSession = Depends(get_db)):
    """
    Verifica si el grafo es conexo.
    Retorna conteo de nodos aislados y porcentaje de conectividad.
    """
    data = await check_graph_connectivity(db)
    alert = data.get("alert")
    return GenericResponse(
        success=data["is_connected"],
        message=alert if alert else "Grafo completamente conexo",
        data=data,
    )


@router.get("/maintenance/stats", response_model=GenericResponse)
async def graph_stats(db: AsyncSession = Depends(get_db)):
    """Estadisticas globales del grafo: nodos, relaciones y distribucion por tipo."""
    data = await get_graph_stats(db)
    return GenericResponse(success=True, message="Estadisticas del grafo", data=data)


@router.post("/maintenance/constraints", response_model=GenericResponse)
async def init_constraints(db: AsyncSession = Depends(get_db)):
    """
    Crea constraints de unicidad para todos los labels primarios.
    Ejecutar una sola vez al inicializar la base de datos.
    """
    created = await create_constraints(db)
    return GenericResponse(
        success=True,
        message=f"{len(created)} constraints procesados",
        data={"constraints": created},
    )

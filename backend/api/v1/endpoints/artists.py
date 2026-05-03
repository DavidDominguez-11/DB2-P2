from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes,
)
from schemas.artist import ArtistCreate, ArtistUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/artists", tags=["artists"])


@router.post("/", response_model=GenericResponse)
async def create_artist(body: ArtistCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await create_node(db, ["Artist"], body.model_dump())
        return GenericResponse(success=True, message="Artista creado", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_artists(
    activo: bool | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = {"activo": activo} if activo is not None else None
    data = await get_nodes(db, "Artist", filters=filters, skip=skip, limit=limit)
    return {"artists": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_artists(
    group_by: str = Query(default="pais"),
    agg_field: str = Query(default="anios_activo"),
    agg_func: str = Query(default="avg"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "Artist", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{artist_id}")
async def get_artist(artist_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "Artist", artist_id)
    if not result:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return result


@router.patch("/{artist_id}", response_model=GenericResponse)
async def update_artist(
    artist_id: str,
    body: ArtistUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "Artist", artist_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return GenericResponse(success=True, message="Artista actualizado", data=result)


@router.delete("/{artist_id}/properties", response_model=GenericResponse)
async def remove_artist_properties(
    artist_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "Artist", artist_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{artist_id}", response_model=GenericResponse)
async def delete_artist(artist_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "Artist", artist_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return GenericResponse(success=True, message=f"Artista {artist_id} eliminado")

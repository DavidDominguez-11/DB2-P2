from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes,
)
from schemas.song import SongCreate, SongUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/songs", tags=["songs"])


@router.post("/", response_model=GenericResponse)
async def create_song(body: SongCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await create_node(db, ["Song"], body.model_dump())
        return GenericResponse(success=True, message="Cancion creada", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_songs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    data = await get_nodes(db, "Song", skip=skip, limit=limit)
    return {"songs": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_songs(
    group_by: str = Query(default="popularidad"),
    agg_field: str = Query(default="duracion"),
    agg_func: str = Query(default="avg"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "Song", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{song_id}")
async def get_song(song_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "Song", song_id)
    if not result:
        raise HTTPException(status_code=404, detail="Cancion no encontrada")
    return result


@router.patch("/{song_id}", response_model=GenericResponse)
async def update_song(
    song_id: str,
    body: SongUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "Song", song_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Cancion no encontrada")
    return GenericResponse(success=True, message="Cancion actualizada", data=result)


@router.delete("/{song_id}/properties", response_model=GenericResponse)
async def remove_song_properties(
    song_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "Song", song_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Cancion no encontrada")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{song_id}", response_model=GenericResponse)
async def delete_song(song_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "Song", song_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cancion no encontrada")
    return GenericResponse(success=True, message=f"Cancion {song_id} eliminada")

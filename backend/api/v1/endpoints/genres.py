from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes,
)
from schemas.genre import GenreCreate, GenreUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/genres", tags=["genres"])


@router.post("/", response_model=GenericResponse)
async def create_genre(body: GenreCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await create_node(db, ["Genre"], body.model_dump())
        return GenericResponse(success=True, message="Genero creado", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_genres(
    activo: bool | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = {"activo": activo} if activo is not None else None
    data = await get_nodes(db, "Genre", filters=filters, skip=skip, limit=limit)
    return {"genres": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_genres(
    group_by: str = Query(default="origen"),
    agg_field: str = Query(default="popularidad"),
    agg_func: str = Query(default="avg"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "Genre", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{genre_id}")
async def get_genre(genre_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "Genre", genre_id)
    if not result:
        raise HTTPException(status_code=404, detail="Genero no encontrado")
    return result


@router.patch("/{genre_id}", response_model=GenericResponse)
async def update_genre(
    genre_id: str,
    body: GenreUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "Genre", genre_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Genero no encontrado")
    return GenericResponse(success=True, message="Genero actualizado", data=result)


@router.delete("/{genre_id}/properties", response_model=GenericResponse)
async def remove_genre_properties(
    genre_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "Genre", genre_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Genero no encontrado")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{genre_id}", response_model=GenericResponse)
async def delete_genre(genre_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "Genre", genre_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Genero no encontrado")
    return GenericResponse(success=True, message=f"Genero {genre_id} eliminado")

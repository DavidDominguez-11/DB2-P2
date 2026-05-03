from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes,
)
from schemas.user import UserCreate, UserUpdate
from schemas.generic import GenericResponse, AffectedResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=GenericResponse)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    labels = ["User", "Artist"] if body.is_artist else ["User"]
    props = body.model_dump()
    try:
        result = await create_node(db, labels, props)
        return GenericResponse(success=True, message="Usuario creado", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_users(
    premium: bool | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = {"premium": premium} if premium is not None else None
    data = await get_nodes(db, "User", filters=filters, skip=skip, limit=limit)
    return {"users": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_users(
    group_by: str = Query(default="premium"),
    agg_field: str = Query(default="user_id"),
    agg_func: str = Query(default="count"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "User", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "User", user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return result


@router.patch("/{user_id}", response_model=GenericResponse)
async def update_user(
    user_id: str,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "User", user_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return GenericResponse(success=True, message="Usuario actualizado", data=result)


@router.delete("/{user_id}/properties", response_model=GenericResponse)
async def remove_user_properties(
    user_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "User", user_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{user_id}", response_model=GenericResponse)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "User", user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return GenericResponse(success=True, message=f"Usuario {user_id} eliminado")

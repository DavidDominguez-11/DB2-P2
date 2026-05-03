from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes,
)
from schemas.post import PostCreate, PostUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=GenericResponse)
async def create_post(body: PostCreate, db: AsyncSession = Depends(get_db)):
    labels = ["Post", "Ad"] if body.is_ad else ["Post"]
    try:
        result = await create_node(db, labels, body.model_dump())
        return GenericResponse(success=True, message="Post creado", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_posts(
    privacidad: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = {"privacidad": privacidad} if privacidad else None
    data = await get_nodes(db, "Post", filters=filters, skip=skip, limit=limit)
    return {"posts": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_posts(
    group_by: str = Query(default="tipo"),
    agg_field: str = Query(default="post_id"),
    agg_func: str = Query(default="count"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "Post", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{post_id}")
async def get_post(post_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "Post", post_id)
    if not result:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return result


@router.patch("/{post_id}", response_model=GenericResponse)
async def update_post(
    post_id: str,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "Post", post_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return GenericResponse(success=True, message="Post actualizado", data=result)


@router.delete("/{post_id}/properties", response_model=GenericResponse)
async def remove_post_properties(
    post_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "Post", post_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{post_id}", response_model=GenericResponse)
async def delete_post(post_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "Post", post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return GenericResponse(success=True, message=f"Post {post_id} eliminado")

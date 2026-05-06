from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes, serialize_value,
)
from schemas.post import PostCreate, PostUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/posts", tags=["posts"])


def _row(record) -> dict:
    return {k: serialize_value(record[k]) for k in record.keys()}


# ── Rutas fijas (antes de /{post_id}) ────────────────────────────────────────

@router.post("/", response_model=GenericResponse)
async def create_post(body: PostCreate, db: AsyncSession = Depends(get_db)):
    labels = ["Post", "Ad"] if body.is_ad else ["Post"]
    try:
        result = await create_node(db, labels, body.model_dump())
        return GenericResponse(success=True, message="Post creado", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/feed")
async def get_feed(
    user_id: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Feed con likes, comentarios y autor via relación CREATED. Filtra por user_id si se provee."""
    if user_id:
        query = """
        MATCH (u:User)-[:CREATED]->(p:Post)
        WHERE toString(u.user_id) = toString($uid)
        OPTIONAL MATCH ()-[l:LIKED]->(p)
        OPTIONAL MATCH ()-[c:COMMENTED]->(p)
        RETURN p.post_id      AS post_id,
               p.caption      AS caption,
               p.fecha        AS fecha,
               p.tipo         AS tipo,
               p.privacidad   AS privacidad,
               p.hashtags     AS hashtags,
               count(DISTINCT l) AS likes,
               count(DISTINCT c) AS comentarios,
               u.username     AS autor,
               u.user_id      AS autor_id
        ORDER BY p.fecha DESC
        SKIP $skip LIMIT $limit
        """
        params: dict = {"uid": user_id, "skip": skip, "limit": limit}
    else:
        query = """
        MATCH (p:Post)
        OPTIONAL MATCH (u:User)-[:CREATED]->(p)
        OPTIONAL MATCH ()-[l:LIKED]->(p)
        OPTIONAL MATCH ()-[c:COMMENTED]->(p)
        RETURN p.post_id      AS post_id,
               p.caption      AS caption,
               p.fecha        AS fecha,
               p.tipo         AS tipo,
               p.privacidad   AS privacidad,
               p.hashtags     AS hashtags,
               count(DISTINCT l) AS likes,
               count(DISTINCT c) AS comentarios,
               u.username     AS autor,
               u.user_id      AS autor_id
        ORDER BY p.fecha DESC
        SKIP $skip LIMIT $limit
        """
        params = {"skip": skip, "limit": limit}
    result = await db.run(query, **params)
    rows = [_row(r) async for r in result]
    return {"posts": rows, "skip": skip, "limit": limit}


@router.get("/feed/follows/{user_id}")
async def get_follows_feed(
    user_id: str,
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Posts de los usuarios que sigue el usuario dado, via relación CREATED."""
    query = """
    MATCH (me:User)-[:FOLLOWS]->(followed:User)-[:CREATED]->(p:Post)
    WHERE toString(me.user_id) = toString($uid)
    OPTIONAL MATCH ()-[l:LIKED]->(p)
    OPTIONAL MATCH ()-[c:COMMENTED]->(p)
    RETURN p.post_id          AS post_id,
           p.caption          AS caption,
           p.fecha            AS fecha,
           p.tipo             AS tipo,
           p.privacidad       AS privacidad,
           p.hashtags         AS hashtags,
           count(DISTINCT l)  AS likes,
           count(DISTINCT c)  AS comentarios,
           followed.username  AS autor,
           followed.user_id   AS autor_id
    ORDER BY p.fecha DESC
    LIMIT $limit
    """
    result = await db.run(query, uid=user_id, limit=limit)
    rows = [_row(r) async for r in result]
    return {"user_id": user_id, "posts": rows}


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


# ── Rutas con parámetros ──────────────────────────────────────────────────────

@router.get("/{post_id}/comments")
async def get_post_comments(post_id: str, db: AsyncSession = Depends(get_db)):
    """Comentarios de un post: relación (User)-[:COMMENTED]->(Post)."""
    query = """
    MATCH (u:User)-[c:COMMENTED]->(p:Post)
    WHERE toString(p.post_id) = toString($pid)
    RETURN elementId(c)  AS rel_id,
           c.contenido   AS contenido,
           c.fecha       AS fecha,
           c.likes       AS likes,
           u.username    AS autor,
           u.user_id     AS autor_id
    ORDER BY c.fecha DESC
    """
    result = await db.run(query, pid=post_id)
    rows = [_row(r) async for r in result]
    return {"post_id": post_id, "comments": rows}


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

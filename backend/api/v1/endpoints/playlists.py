from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from crud.nodes import (
    create_node, get_node_with_connections, get_nodes,
    update_node_properties, remove_node_properties, delete_node,
    aggregate_nodes, serialize_value,
)
from schemas.playlist import PlaylistCreate, PlaylistUpdate
from schemas.generic import GenericResponse

router = APIRouter(prefix="/playlists", tags=["playlists"])


def _row(record) -> dict:
    return {k: serialize_value(record[k]) for k in record.keys()}


# ── Rutas fijas (antes de /{playlist_id}) ────────────────────────────────────

@router.post("/", response_model=GenericResponse)
async def create_playlist(body: PlaylistCreate, db: AsyncSession = Depends(get_db)):
    labels = ["Playlist", "Featured"] if body.is_featured else ["Playlist"]
    try:
        result = await create_node(db, labels, body.model_dump())
        return GenericResponse(success=True, message="Playlist creada", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/by-user/{user_id}")
async def playlists_by_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Playlists creadas por un usuario via relación CREATED_PLAYLIST."""
    query = """
    MATCH (u:User)-[:CREATED_PLAYLIST]->(p:Playlist)
    WHERE toString(u.user_id) = toString($uid)
    RETURN p.playlist_id    AS playlist_id,
           p.nombre         AS nombre,
           p.descripcion    AS descripcion,
           p.fecha_creacion AS fecha_creacion,
           p.publica        AS publica,
           p.numero_canciones AS numero_canciones,
           u.username       AS creador
    ORDER BY p.fecha_creacion DESC
    """
    result = await db.run(query, uid=user_id)
    rows = [_row(r) async for r in result]
    return {"user_id": user_id, "playlists": rows}


@router.get("/")
async def list_playlists(
    publica: bool | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = {"publica": publica} if publica is not None else None
    data = await get_nodes(db, "Playlist", filters=filters, skip=skip, limit=limit)
    return {"playlists": data, "skip": skip, "limit": limit}


@router.get("/aggregate")
async def aggregate_playlists(
    group_by: str = Query(default="publica"),
    agg_field: str = Query(default="numero_canciones"),
    agg_func: str = Query(default="avg"),
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await aggregate_nodes(db, "Playlist", group_by, agg_field, agg_func)
        return {"aggregation": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Rutas con parámetro /{playlist_id} ───────────────────────────────────────

@router.get("/{playlist_id}/songs")
async def playlist_songs(
    playlist_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Canciones de una playlist via relación INCLUDES."""
    query = """
    MATCH (p:Playlist)-[i:INCLUDES]->(s:Song)
    WHERE toString(p.playlist_id) = toString($pid)
    RETURN s.song_id           AS song_id,
           s.titulo            AS titulo,
           s.duracion          AS duracion,
           s.popularidad       AS popularidad,
           s.fecha_lanzamiento AS fecha_lanzamiento,
           i.orden             AS orden
    ORDER BY i.orden, s.titulo
    """
    result = await db.run(query, pid=playlist_id)
    rows = [_row(r) async for r in result]
    return {"playlist_id": playlist_id, "songs": rows, "total": len(rows)}


@router.get("/{playlist_id}")
async def get_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_node_with_connections(db, "Playlist", playlist_id)
    if not result:
        raise HTTPException(status_code=404, detail="Playlist no encontrada")
    return result


@router.patch("/{playlist_id}", response_model=GenericResponse)
async def update_playlist(
    playlist_id: str,
    body: PlaylistUpdate,
    db: AsyncSession = Depends(get_db),
):
    props = {k: v for k, v in body.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    result = await update_node_properties(db, "Playlist", playlist_id, props)
    if not result:
        raise HTTPException(status_code=404, detail="Playlist no encontrada")
    return GenericResponse(success=True, message="Playlist actualizada", data=result)


@router.delete("/{playlist_id}/properties", response_model=GenericResponse)
async def remove_playlist_properties(
    playlist_id: str,
    properties: list[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await remove_node_properties(db, "Playlist", playlist_id, properties)
    if not result:
        raise HTTPException(status_code=404, detail="Playlist no encontrada")
    return GenericResponse(success=True, message="Propiedades eliminadas", data=result)


@router.delete("/{playlist_id}", response_model=GenericResponse)
async def delete_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_node(db, "Playlist", playlist_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Playlist no encontrada")
    return GenericResponse(success=True, message=f"Playlist {playlist_id} eliminada")

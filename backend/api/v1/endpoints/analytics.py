from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession
from core.database import get_db
from services.gds_service import (
    jaccard_similar_users,
    recommend_songs,
    influence_ranking,
    popular_songs,
    genre_distribution,
    user_activity_summary,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/recommendations/{user_id}")
async def song_recommendations(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Recomienda canciones al usuario basandose en similitud Jaccard
    con otros usuarios que tienen patrones de escucha similares.
    """
    data = await recommend_songs(db, user_id, limit=limit)
    return {
        "user_id": user_id,
        "algorithm": "jaccard_collaborative_filtering",
        "recommendations": data,
    }


@router.get("/similar-users/{user_id}")
async def similar_users(
    user_id: str,
    limit: int = Query(default=5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna los usuarios con mayor similitud de Jaccard respecto al usuario dado,
    calculada a partir de canciones en comun dentro de LISTENED.
    """
    data = await jaccard_similar_users(db, user_id, limit=limit)
    if data is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {
        "user_id": user_id,
        "algorithm": "jaccard_similarity",
        "similar_users": data,
    }


@router.get("/influence")
async def influence_rank(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Ranking de influencia de usuarios calculado con pesos sobre:
    seguidores (50%), likes recibidos (30%), comentarios recibidos (20%).
    """
    data = await influence_ranking(db, limit=limit)
    return {
        "algorithm": "weighted_influence_score",
        "weights": {"followers": 0.5, "likes": 0.3, "comments": 0.2},
        "ranking": data,
    }


@router.get("/popular-songs")
async def top_songs(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Canciones mas escuchadas con cantidad de oyentes unicos
    y promedio de duracion de escucha.
    """
    data = await popular_songs(db, limit=limit)
    return {"popular_songs": data}


@router.get("/genre-distribution")
async def genre_stats(db: AsyncSession = Depends(get_db)):
    """
    Distribucion de canciones y total de escuchas agrupadas por genero.
    """
    data = await genre_distribution(db)
    return {"genre_distribution": data}


@router.get("/user-activity/{user_id}")
async def user_activity(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Resumen de actividad de un usuario: canciones escuchadas, posts creados,
    seguidores, seguidos y playlists creadas.
    """
    data = await user_activity_summary(db, user_id)
    if not data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return data

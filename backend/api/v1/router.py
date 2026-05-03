from fastapi import APIRouter
from api.v1.endpoints import (
    users, songs, posts, artists, playlists, genres,
    interactions, analytics, bulk,
)

router = APIRouter(prefix="/api/v1")

router.include_router(users.router)
router.include_router(songs.router)
router.include_router(posts.router)
router.include_router(artists.router)
router.include_router(playlists.router)
router.include_router(genres.router)
router.include_router(interactions.router)
router.include_router(analytics.router)
router.include_router(bulk.router)

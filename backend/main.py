from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import get_driver, close_driver
from api.v1.router import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa el driver singleton al arrancar
    get_driver()
    yield
    # Cierra la conexion al apagar el servidor
    await close_driver()


app = FastAPI(
    title="ParaMetrix API",
    description="Backend de red social musical sobre Neo4j AuraDB",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ParaMetrix API"}

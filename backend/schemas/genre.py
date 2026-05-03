from pydantic import BaseModel
from typing import Optional


class GenreCreate(BaseModel):
    genre_id: str
    nombre: str
    descripcion: str
    popularidad: int = 0
    origen: str
    activo: bool = True


class GenreUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    popularidad: Optional[int] = None
    origen: Optional[str] = None
    activo: Optional[bool] = None


class GenreOut(BaseModel):
    genre_id: str
    nombre: str
    descripcion: str
    popularidad: int
    origen: str
    activo: bool
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

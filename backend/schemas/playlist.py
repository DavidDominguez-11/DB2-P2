from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class PlaylistCreate(BaseModel):
    playlist_id: str
    nombre: str
    descripcion: str
    fecha_creacion: date
    publica: bool = True
    numero_canciones: int = 0
    # cuando es True, el nodo recibe la etiqueta adicional :Featured
    is_featured: bool = False

    @field_validator("fecha_creacion", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class PlaylistUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    publica: Optional[bool] = None
    numero_canciones: Optional[int] = None


class PlaylistOut(BaseModel):
    playlist_id: str
    nombre: str
    descripcion: str
    fecha_creacion: str
    publica: bool
    numero_canciones: int
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

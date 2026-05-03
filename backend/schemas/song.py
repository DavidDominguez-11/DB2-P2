from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class SongCreate(BaseModel):
    song_id: str
    titulo: str
    duracion: float
    fecha_lanzamiento: date
    popularidad: int = 0
    idiomas: list[str] = []

    @field_validator("fecha_lanzamiento", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class SongUpdate(BaseModel):
    titulo: Optional[str] = None
    duracion: Optional[float] = None
    popularidad: Optional[int] = None
    idiomas: Optional[list[str]] = None


class SongOut(BaseModel):
    song_id: str
    titulo: str
    duracion: float
    fecha_lanzamiento: str
    popularidad: int
    idiomas: list[str]
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

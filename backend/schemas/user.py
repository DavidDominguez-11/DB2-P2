from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class UserCreate(BaseModel):
    user_id: str
    username: str
    email: str
    fecha_registro: date
    premium: bool = False
    generos_favoritos: list[str] = []
    # cuando es True, el nodo recibe la etiqueta adicional :Artist
    is_artist: bool = False

    @field_validator("fecha_registro", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    premium: Optional[bool] = None
    generos_favoritos: Optional[list[str]] = None


class UserOut(BaseModel):
    user_id: str
    username: str
    email: str
    fecha_registro: str
    premium: bool
    generos_favoritos: list[str]
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

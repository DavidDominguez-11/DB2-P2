from pydantic import BaseModel
from typing import Optional


class ArtistCreate(BaseModel):
    artist_id: str
    nombre: str
    pais: str
    genero_principal: str
    activo: bool = True
    anios_activo: int = 0


class ArtistUpdate(BaseModel):
    nombre: Optional[str] = None
    pais: Optional[str] = None
    genero_principal: Optional[str] = None
    activo: Optional[bool] = None
    anios_activo: Optional[int] = None


class ArtistOut(BaseModel):
    artist_id: str
    nombre: str
    pais: str
    genero_principal: str
    activo: bool
    anios_activo: int
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

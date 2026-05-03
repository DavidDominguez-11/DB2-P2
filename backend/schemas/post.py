from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class PostCreate(BaseModel):
    post_id: str
    caption: str
    fecha: date
    tipo: str
    privacidad: str = "public"
    hashtags: list[str] = []
    # cuando es True, el nodo recibe la etiqueta adicional :Ad
    is_ad: bool = False

    @field_validator("fecha", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class PostUpdate(BaseModel):
    caption: Optional[str] = None
    privacidad: Optional[str] = None
    hashtags: Optional[list[str]] = None


class PostOut(BaseModel):
    post_id: str
    caption: str
    fecha: str
    tipo: str
    privacidad: str
    hashtags: list[str]
    labels: list[str] = []
    element_id: Optional[str] = None

    model_config = {"from_attributes": True}

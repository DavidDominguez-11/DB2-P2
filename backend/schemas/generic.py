from pydantic import BaseModel
from typing import Any, Optional


class GenericResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


class AffectedResponse(BaseModel):
    success: bool
    affected: int
    message: str


class NodeResponse(BaseModel):
    element_id: Optional[str] = None
    labels: list[str] = []
    properties: dict[str, Any] = {}
    connections: Optional[list[dict]] = None


class RelationshipResponse(BaseModel):
    element_id: Optional[str] = None
    type: str
    properties: dict[str, Any] = {}
    start_node: Optional[dict] = None
    end_node: Optional[dict] = None


class PaginatedResponse(BaseModel):
    skip: int
    limit: int
    data: list[Any]

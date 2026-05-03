from pydantic import BaseModel, field_validator
from typing import Any, Optional
from datetime import date


class BulkUpdateNodesRequest(BaseModel):
    label: str
    filter_property: str
    filter_value: Any
    update_data: dict[str, Any]


class BulkRemoveNodePropertyRequest(BaseModel):
    label: str
    property_to_remove: str
    filter_property: Optional[str] = None
    filter_value: Optional[Any] = None


class BulkUpdateRelationshipsRequest(BaseModel):
    rel_type: str
    filter_property: str
    filter_value: Any
    update_data: dict[str, Any]


class BulkRemoveRelPropertyRequest(BaseModel):
    rel_type: str
    property_to_remove: str
    filter_property: Optional[str] = None
    filter_value: Optional[Any] = None


class BulkDeleteNodesRequest(BaseModel):
    label: str
    filter_property: str
    filter_value: Any


class BulkDeleteRelationshipsRequest(BaseModel):
    rel_type: str
    filter_property: str
    filter_value: Any


class CreateRelationshipRequest(BaseModel):
    from_label: str
    from_id: str
    to_label: str
    to_id: str
    rel_type: str
    properties: dict[str, Any] = {}


class UpdateRelationshipRequest(BaseModel):
    properties: dict[str, Any]


class RemoveRelationshipPropertiesRequest(BaseModel):
    property_names: list[str]

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession
from neo4j.graph import Node, Relationship
from pydantic import BaseModel
from typing import Any

from core.database import get_db
from crud.nodes import serialize_value

router = APIRouter(prefix="/cypher", tags=["cypher"])


class CypherRequest(BaseModel):
    query: str


def _serialize(val: Any) -> Any:
    """Serializa cualquier valor Neo4j a un tipo JSON-compatible."""
    if isinstance(val, Node):
        data = {k: _serialize(v) for k, v in val.items()}
        data["_labels"] = list(val.labels)
        data["_element_id"] = val.element_id
        return data
    if isinstance(val, Relationship):
        return {
            "_type": val.type,
            "_element_id": val.element_id,
            **{k: _serialize(v) for k, v in val.items()},
        }
    if isinstance(val, list):
        return [_serialize(v) for v in val]
    if isinstance(val, dict):
        return {k: _serialize(v) for k, v in val.items()}
    return serialize_value(val)


@router.post("/query")
async def run_cypher(body: CypherRequest, db: AsyncSession = Depends(get_db)):
    query = body.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="La query no puede estar vacía")

    lower = query.lower()
    forbidden = ["drop ", "call apoc.schema.assert", "call db.clearquerycaches"]
    for f in forbidden:
        if f in lower:
            raise HTTPException(status_code=400, detail=f"Operación no permitida: {f.strip()}")

    try:
        result = await db.run(query)
        rows = []
        async for record in result:
            rows.append({key: _serialize(record[key]) for key in record.keys()})
        return {"results": rows, "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

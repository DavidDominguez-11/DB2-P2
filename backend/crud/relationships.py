from neo4j import AsyncSession
from crud.nodes import serialize_value, node_to_dict, prepare_properties
from models.labels import VALID_LABELS, ID_FIELD_MAP, NodeLabel, PRIMARY_LABELS
from models.relations import VALID_RELATION_TYPES


def rel_to_dict(rel, start_node=None, end_node=None) -> dict:
    """Convierte una relacion Neo4j a diccionario Python."""
    data = {k: serialize_value(v) for k, v in rel.items()}
    data["type"] = rel.type
    data["element_id"] = rel.element_id
    if start_node is not None:
        data["start_node"] = node_to_dict(start_node)
    if end_node is not None:
        data["end_node"] = node_to_dict(end_node)
    return data


async def create_relationship(
    session: AsyncSession,
    from_label: str,
    from_id: str,
    to_label: str,
    to_id: str,
    rel_type: str,
    properties: dict,
) -> dict | None:
    for label in [from_label, to_label]:
        if label not in VALID_LABELS:
            raise ValueError(f"Label invalido: {label}")
    if rel_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Tipo de relacion invalido: {rel_type}")

    from_id_field = ID_FIELD_MAP.get(NodeLabel(from_label))
    to_id_field = ID_FIELD_MAP.get(NodeLabel(to_label))

    if not from_id_field or not to_id_field:
        raise ValueError("Los labels origen/destino deben ser labels primarios con ID")

    prepared = prepare_properties(properties)
    query = f"""
    MATCH (a:{from_label} {{{from_id_field}: $from_id}})
    MATCH (b:{to_label} {{{to_id_field}: $to_id}})
    CREATE (a)-[r:{rel_type}]->(b)
    SET r += $props
    RETURN r, a, b
    """
    result = await session.run(query, from_id=from_id, to_id=to_id, props=prepared)
    record = await result.single()
    if not record:
        return None
    return rel_to_dict(record["r"], record["a"], record["b"])


async def get_relationship(session: AsyncSession, element_id: str) -> dict | None:
    query = """
    MATCH (a)-[r]->(b)
    WHERE elementId(r) = $eid
    RETURN r, a, b
    """
    result = await session.run(query, eid=element_id)
    record = await result.single()
    if not record:
        return None
    return rel_to_dict(record["r"], record["a"], record["b"])


async def get_relationships_by_type(
    session: AsyncSession,
    rel_type: str,
    limit: int = 25,
) -> list[dict]:
    if rel_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Tipo de relacion invalido: {rel_type}")

    query = f"MATCH (a)-[r:{rel_type}]->(b) RETURN r, a, b LIMIT $limit"
    result = await session.run(query, limit=limit)
    rels = []
    async for record in result:
        rels.append(rel_to_dict(record["r"], record["a"], record["b"]))
    return rels


async def update_relationship_properties(
    session: AsyncSession,
    element_id: str,
    properties: dict,
) -> dict | None:
    prepared = prepare_properties(properties)
    query = """
    MATCH ()-[r]->()
    WHERE elementId(r) = $eid
    SET r += $props
    RETURN r
    """
    result = await session.run(query, eid=element_id, props=prepared)
    record = await result.single()
    return rel_to_dict(record["r"]) if record else None


async def remove_relationship_properties(
    session: AsyncSession,
    element_id: str,
    property_names: list[str],
) -> dict | None:
    remove_clause = ", ".join(f"r.{p}" for p in property_names)
    query = f"""
    MATCH ()-[r]->()
    WHERE elementId(r) = $eid
    REMOVE {remove_clause}
    RETURN r
    """
    result = await session.run(query, eid=element_id)
    record = await result.single()
    return rel_to_dict(record["r"]) if record else None


async def delete_relationship(session: AsyncSession, element_id: str) -> bool:
    query = """
    MATCH ()-[r]->()
    WHERE elementId(r) = $eid
    WITH r, elementId(r) AS eid
    DELETE r
    RETURN count(eid) AS deleted
    """
    result = await session.run(query, eid=element_id)
    record = await result.single()
    return bool(record and record["deleted"] > 0)

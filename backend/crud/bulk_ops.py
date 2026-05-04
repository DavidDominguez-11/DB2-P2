from neo4j import AsyncSession
from crud.nodes import prepare_properties
from models.labels import VALID_LABELS
from models.relations import VALID_RELATION_TYPES, ALLOWED_NODE_PROPERTIES, ALLOWED_REL_PROPERTIES


def _validate_prop(entity: str, prop: str, allowlist: dict) -> None:
    """Lanza ValueError si la propiedad no esta en el allowlist del entity.
    Si el entity no tiene allowlist definido, se permite cualquier propiedad."""
    allowed = allowlist.get(entity)
    if allowed is None:
        return  # entidad sin allowlist → permitir todo
    if prop not in allowed:
        raise ValueError(f"Propiedad '{prop}' no permitida para '{entity}'. Permitidas: {sorted(allowed)}")


async def bulk_update_nodes(
    session: AsyncSession,
    label: str,
    filter_property: str,
    filter_value,
    update_data: dict,
) -> int:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")
    _validate_prop(label, filter_property, ALLOWED_NODE_PROPERTIES)
    for prop in update_data:
        _validate_prop(label, prop, ALLOWED_NODE_PROPERTIES)

    prepared = prepare_properties(update_data)
    query = f"""
    MATCH (n:{label})
    WHERE n.{filter_property} = $filter_val
    SET n += $update_data
    RETURN count(n) AS updated
    """
    result = await session.run(query, filter_val=filter_value, update_data=prepared)
    record = await result.single()
    return record["updated"] if record else 0


async def bulk_remove_node_property(
    session: AsyncSession,
    label: str,
    property_to_remove: str,
    filter_property: str | None = None,
    filter_value=None,
) -> int:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")
    _validate_prop(label, property_to_remove, ALLOWED_NODE_PROPERTIES)

    where_clause = ""
    params: dict = {}
    if filter_property and filter_value is not None:
        _validate_prop(label, filter_property, ALLOWED_NODE_PROPERTIES)
        where_clause = f"WHERE n.{filter_property} = $filter_val"
        params["filter_val"] = filter_value

    query = f"""
    MATCH (n:{label}) {where_clause}
    REMOVE n.{property_to_remove}
    RETURN count(n) AS affected
    """
    result = await session.run(query, **params)
    record = await result.single()
    return record["affected"] if record else 0


async def bulk_update_relationships(
    session: AsyncSession,
    rel_type: str,
    filter_property: str,
    filter_value,
    update_data: dict,
) -> int:
    if rel_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Tipo de relacion invalido: {rel_type}")
    _validate_prop(rel_type, filter_property, ALLOWED_REL_PROPERTIES)
    for prop in update_data:
        _validate_prop(rel_type, prop, ALLOWED_REL_PROPERTIES)

    prepared = prepare_properties(update_data)
    query = f"""
    MATCH ()-[r:{rel_type}]->()
    WHERE r.{filter_property} = $filter_val
    SET r += $update_data
    RETURN count(r) AS updated
    """
    result = await session.run(query, filter_val=filter_value, update_data=prepared)
    record = await result.single()
    return record["updated"] if record else 0


async def bulk_remove_relationship_property(
    session: AsyncSession,
    rel_type: str,
    property_to_remove: str,
    filter_property: str | None = None,
    filter_value=None,
) -> int:
    if rel_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Tipo de relacion invalido: {rel_type}")
    _validate_prop(rel_type, property_to_remove, ALLOWED_REL_PROPERTIES)

    where_clause = ""
    params: dict = {}
    if filter_property and filter_value is not None:
        _validate_prop(rel_type, filter_property, ALLOWED_REL_PROPERTIES)
        where_clause = f"WHERE r.{filter_property} = $filter_val"
        params["filter_val"] = filter_value

    query = f"""
    MATCH ()-[r:{rel_type}]->() {where_clause}
    REMOVE r.{property_to_remove}
    RETURN count(r) AS affected
    """
    result = await session.run(query, **params)
    record = await result.single()
    return record["affected"] if record else 0


async def bulk_delete_nodes(
    session: AsyncSession,
    label: str,
    filter_property: str,
    filter_value,
) -> int:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")
    _validate_prop(label, filter_property, ALLOWED_NODE_PROPERTIES)

    query = f"""
    MATCH (n:{label})
    WHERE n.{filter_property} = $filter_val
    WITH n, n.{filter_property} AS marker
    DETACH DELETE n
    RETURN count(marker) AS deleted
    """
    result = await session.run(query, filter_val=filter_value)
    record = await result.single()
    return record["deleted"] if record else 0


async def bulk_delete_relationships(
    session: AsyncSession,
    rel_type: str,
    filter_property: str,
    filter_value,
) -> int:
    if rel_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Tipo de relacion invalido: {rel_type}")
    _validate_prop(rel_type, filter_property, ALLOWED_REL_PROPERTIES)

    query = f"""
    MATCH ()-[r:{rel_type}]->()
    WHERE r.{filter_property} = $filter_val
    WITH r, r.{filter_property} AS marker
    DELETE r
    RETURN count(marker) AS deleted
    """
    result = await session.run(query, filter_val=filter_value)
    record = await result.single()
    return record["deleted"] if record else 0

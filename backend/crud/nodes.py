from neo4j import AsyncSession
from neo4j.time import Date as Neo4jDate, DateTime as Neo4jDateTime
from datetime import date
from models.labels import NodeLabel, ID_FIELD_MAP, VALID_LABELS, PRIMARY_LABELS

# Propiedades conocidas que almacenan fechas en el grafo
DATE_FIELDS: set[str] = {
    "fecha_registro",
    "fecha_lanzamiento",
    "fecha_creacion",
    "fecha",
    "fecha_agregado",
    "fecha_colaboracion",
    "fecha_asignacion",
}


def serialize_value(value):
    """Convierte tipos nativos de Neo4j a tipos serializables por JSON."""
    if isinstance(value, (Neo4jDate, Neo4jDateTime)):
        return str(value)
    if isinstance(value, list):
        return [serialize_value(v) for v in value]
    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    return value


def node_to_dict(node) -> dict:
    """Convierte un nodo Neo4j a diccionario Python."""
    data = {k: serialize_value(v) for k, v in node.items()}
    data["labels"] = list(node.labels)
    data["element_id"] = node.element_id
    return data


def prepare_properties(props: dict) -> dict:
    """Convierte date strings y objetos Python date a neo4j.time.Date antes de persistir."""
    result = {}
    for key, value in props.items():
        if key in DATE_FIELDS:
            if isinstance(value, str) and value:
                d = date.fromisoformat(value)
                result[key] = Neo4jDate(d.year, d.month, d.day)
            elif isinstance(value, date):
                result[key] = Neo4jDate(value.year, value.month, value.day)
            else:
                result[key] = value
        else:
            result[key] = value
    return result


def get_primary_label(labels: list[str]) -> str:
    """Devuelve el primer label que tenga un campo ID definido."""
    for label in labels:
        if label in PRIMARY_LABELS:
            return label
    return labels[0]


async def create_node(
    session: AsyncSession,
    labels: list[str],
    properties: dict,
) -> dict | None:
    for label in labels:
        if label not in VALID_LABELS:
            raise ValueError(f"Label invalido: {label}")

    primary = get_primary_label(labels)
    id_field = ID_FIELD_MAP.get(NodeLabel(primary))
    if not id_field or id_field not in properties:
        raise ValueError(f"Falta el campo ID requerido: {id_field}")

    labels_str = ":".join(labels)
    # is_artist / is_featured / is_ad son flags de control, no van al grafo
    clean_props = {k: v for k, v in properties.items() if not k.startswith("is_")}
    prepared = prepare_properties(clean_props)

    query = f"MERGE (n:{labels_str} {{{id_field}: $id}}) SET n += $props RETURN n"
    result = await session.run(query, id=properties[id_field], props=prepared)
    record = await result.single()
    return node_to_dict(record["n"]) if record else None


async def get_node_with_connections(
    session: AsyncSession,
    label: str,
    node_id: str,
) -> dict | None:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    id_field = ID_FIELD_MAP.get(NodeLabel(label))
    query = f"""
    MATCH (n:{label} {{{id_field}: $id}})
    OPTIONAL MATCH (n)-[r]-(m)
    RETURN n, collect({{
        rel_type: type(r),
        rel_props: properties(r),
        neighbor: m
    }}) AS connections
    """
    result = await session.run(query, id=node_id)
    record = await result.single()
    if not record:
        return None

    node_data = node_to_dict(record["n"])
    connections = []
    for conn in record["connections"]:
        if conn["neighbor"] is not None:
            connections.append({
                "rel_type": conn["rel_type"],
                "rel_props": {k: serialize_value(v) for k, v in conn["rel_props"].items()},
                "neighbor": node_to_dict(conn["neighbor"]),
            })
    node_data["connections"] = connections
    return node_data


async def get_nodes(
    session: AsyncSession,
    label: str,
    filters: dict | None = None,
    skip: int = 0,
    limit: int = 25,
) -> list[dict]:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    params: dict = {"skip": skip, "limit": limit}
    where_clause = ""

    if filters:
        conditions = []
        for i, (key, value) in enumerate(filters.items()):
            param_key = f"fv_{i}"
            conditions.append(f"n.{key} = ${param_key}")
            params[param_key] = value
        where_clause = "WHERE " + " AND ".join(conditions)

    query = f"MATCH (n:{label}) {where_clause} RETURN n SKIP $skip LIMIT $limit"
    result = await session.run(query, **params)
    nodes = []
    async for record in result:
        nodes.append(node_to_dict(record["n"]))
    return nodes


async def update_node_properties(
    session: AsyncSession,
    label: str,
    node_id: str,
    properties: dict,
) -> dict | None:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    id_field = ID_FIELD_MAP.get(NodeLabel(label))
    prepared = prepare_properties(properties)
    query = f"MATCH (n:{label} {{{id_field}: $id}}) SET n += $props RETURN n"
    result = await session.run(query, id=node_id, props=prepared)
    record = await result.single()
    return node_to_dict(record["n"]) if record else None


async def remove_node_properties(
    session: AsyncSession,
    label: str,
    node_id: str,
    property_names: list[str],
) -> dict | None:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    id_field = ID_FIELD_MAP.get(NodeLabel(label))
    remove_clause = ", ".join(f"n.{p}" for p in property_names)
    query = f"MATCH (n:{label} {{{id_field}: $id}}) REMOVE {remove_clause} RETURN n"
    result = await session.run(query, id=node_id)
    record = await result.single()
    return node_to_dict(record["n"]) if record else None


async def delete_node(
    session: AsyncSession,
    label: str,
    node_id: str,
) -> bool:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    id_field = ID_FIELD_MAP.get(NodeLabel(label))
    query = f"""
    MATCH (n:{label} {{{id_field}: $id}})
    WITH n, n.{id_field} as deleted_id
    DETACH DELETE n
    RETURN count(deleted_id) AS deleted
    """
    result = await session.run(query, id=node_id)
    record = await result.single()
    return bool(record and record["deleted"] > 0)


async def aggregate_nodes(
    session: AsyncSession,
    label: str,
    group_by: str,
    agg_field: str,
    agg_func: str = "count",
) -> list[dict]:
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    valid_agg = {"count", "avg", "sum", "min", "max"}
    if agg_func not in valid_agg:
        raise ValueError(f"Funcion de agregacion invalida: {agg_func}")

    agg_expr = f"count(n.{agg_field})" if agg_func == "count" else f"{agg_func}(n.{agg_field})"
    query = f"""
    MATCH (n:{label})
    RETURN n.{group_by} AS group_value, {agg_expr} AS agg_result
    ORDER BY agg_result DESC
    LIMIT 20
    """
    result = await session.run(query)
    records = await result.data()
    return [{"group_value": r["group_value"], "agg_result": r["agg_result"]} for r in records]

import csv
import io
from neo4j import AsyncSession
from crud.nodes import create_node, prepare_properties
from models.labels import VALID_LABELS, ID_FIELD_MAP, NodeLabel


async def check_graph_connectivity(session: AsyncSession) -> dict:
    """
    Detecta nodos aislados (sin ninguna relacion).
    Si isolated_nodes > 0, el grafo no es completamente conexo.
    """
    query = """
    MATCH (n)
    WITH count(n) AS total_nodes
    MATCH (isolated)
    WHERE NOT (isolated)--()
    RETURN total_nodes, count(isolated) AS isolated_nodes
    """
    result = await session.run(query)
    record = await result.single()

    if not record:
        return {"total_nodes": 0, "isolated_nodes": 0, "is_connected": True}

    total = record["total_nodes"]
    isolated = record["isolated_nodes"]
    return {
        "total_nodes": total,
        "isolated_nodes": isolated,
        "is_connected": isolated == 0,
        "connectivity_pct": round((total - isolated) / max(total, 1) * 100, 2),
        "alert": None if isolated == 0 else f"{isolated} nodos aislados detectados",
    }


async def get_graph_stats(session: AsyncSession) -> dict:
    """Estadisticas globales del grafo: total de nodos, relaciones y distribucion por label."""
    totals_query = """
    MATCH (n)
    WITH count(n) AS total_nodes
    MATCH ()-[r]->()
    RETURN total_nodes, count(r) AS total_rels
    """
    totals_result = await session.run(totals_query)
    totals_record = await totals_result.single()

    label_query = """
    MATCH (n)
    UNWIND labels(n) AS lbl
    RETURN lbl AS label, count(n) AS count
    ORDER BY count DESC
    """
    label_result = await session.run(label_query)
    label_records = await label_result.data()

    rel_type_query = """
    MATCH ()-[r]->()
    RETURN type(r) AS rel_type, count(r) AS count
    ORDER BY count DESC
    """
    rel_result = await session.run(rel_type_query)
    rel_records = await rel_result.data()

    return {
        "total_nodes": totals_record["total_nodes"] if totals_record else 0,
        "total_relationships": totals_record["total_rels"] if totals_record else 0,
        "nodes_by_label": {r["label"]: r["count"] for r in label_records},
        "relationships_by_type": {r["rel_type"]: r["count"] for r in rel_records},
    }


async def load_nodes_from_csv(
    session: AsyncSession,
    label: str,
    csv_content: str,
) -> dict:
    """
    Carga nodos desde contenido CSV en memoria.
    Usa MERGE para idempotencia: nodos existentes se actualizan, nuevos se crean.
    Devuelve conteo de nodos procesados y errores.
    """
    if label not in VALID_LABELS:
        raise ValueError(f"Label invalido: {label}")

    reader = csv.DictReader(io.StringIO(csv_content))
    processed = 0
    errors = []

    for row_num, row in enumerate(reader, start=2):
        try:
            props = dict(row)
            # Elimina campos vacios
            props = {k: v for k, v in props.items() if v is not None and v != ""}
            await create_node(session, [label], props)
            processed += 1
        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})

    return {
        "label": label,
        "processed": processed,
        "errors_count": len(errors),
        "errors": errors[:10],  # maximo 10 errores en la respuesta
    }


async def create_constraints(session: AsyncSession) -> list[str]:
    """
    Crea constraints de unicidad para todos los labels primarios.
    Debe ejecutarse una sola vez al inicializar la base de datos.
    """
    created = []
    for label, id_field in ID_FIELD_MAP.items():
        constraint_name = f"unique_{label.lower()}_{id_field}"
        query = f"""
        CREATE CONSTRAINT {constraint_name} IF NOT EXISTS
        FOR (n:{label}) REQUIRE n.{id_field} IS UNIQUE
        """
        try:
            await session.run(query)
            created.append(constraint_name)
        except Exception as e:
            created.append(f"ERROR en {constraint_name}: {str(e)}")

    return created

from enum import Enum


class RelationType(str, Enum):
    FOLLOWS = "FOLLOWS"
    CREATED = "CREATED"
    CONTAINS = "CONTAINS"
    LIKED = "LIKED"
    COMMENTED = "COMMENTED"
    CREATED_PLAYLIST = "CREATED_PLAYLIST"
    INCLUDES = "INCLUDES"
    BY = "BY"
    BELONGS_TO = "BELONGS_TO"
    LISTENED = "LISTENED"
    FOLLOWS_ARTIST = "FOLLOWS_ARTIST"
    SAVED = "SAVED"


VALID_RELATION_TYPES: set[str] = {rel.value for rel in RelationType}

# Allowlist of mutable properties per node label — prevents Cypher injection
ALLOWED_NODE_PROPERTIES: dict[str, set[str]] = {
    "User": {"username", "email", "premium", "generos_favoritos", "fecha_registro", "activo"},
    "Song": {"titulo", "duracion", "popularidad", "idiomas", "fecha_lanzamiento"},
    "Artist": {"nombre", "pais", "genero_principal", "activo", "anios_activo"},
    "Post": {"caption", "tipo", "privacidad", "hashtags", "fecha"},
    "Playlist": {"nombre", "descripcion", "publica", "numero_canciones", "fecha_creacion"},
    "Genre": {"nombre", "descripcion", "popularidad", "origen", "activo"},
}

# Allowlist of mutable properties per relationship type
ALLOWED_REL_PROPERTIES: dict[str, set[str]] = {
    "FOLLOWS": {"notificaciones", "cercania", "fecha"},
    "CREATED": {"dispositivo", "ubicacion", "fecha_creacion"},
    "CONTAINS": {"orden", "destacado", "timestamp"},
    "LIKED": {"reaccion", "intensidad", "fecha"},
    "COMMENTED": {"contenido", "likes", "fecha"},
    "CREATED_PLAYLIST": {"colaborativa", "numero_ediciones", "fecha"},
    "INCLUDES": {"orden", "favorito", "fecha_agregado"},
    "BY": {"rol", "principal", "fecha_colaboracion"},
    "BELONGS_TO": {"relevancia", "principal", "fecha_asignacion"},
    "LISTENED": {"duracion_escuchada", "completado", "fecha"},
    "FOLLOWS_ARTIST": {"notificaciones", "interacciones", "fecha"},
    "SAVED": {"veces_reproducida", "favorita", "fecha"},
}

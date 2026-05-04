from enum import Enum


class RelationType(str, Enum):
    FOLLOWS          = "FOLLOWS"
    CREATED          = "CREATED"
    CONTAINS         = "CONTAINS"
    LIKED            = "LIKED"
    COMMENTED        = "COMMENTED"
    CREATED_PLAYLIST = "CREATED_PLAYLIST"
    INCLUDES         = "INCLUDES"
    BY               = "BY"
    BELONGS_TO       = "BELONGS_TO"
    LISTENED         = "LISTENED"
    FOLLOWS_ARTIST   = "FOLLOWS_ARTIST"
    SAVED            = "SAVED"
    POSTED           = "POSTED"
    FEATURED_IN      = "FEATURED_IN"
    COLLABORATED_WITH = "COLLABORATED_WITH"
    SHARED           = "SHARED"


VALID_RELATION_TYPES: set[str] = {rel.value for rel in RelationType}

# Propiedades mutables por tipo de relación
ALLOWED_REL_PROPERTIES: dict[str, set[str]] = {
    "FOLLOWS": {
        "notificaciones", "cercania", "fecha", "plataforma",
        "activo", "migrated",
    },
    "LISTENED": {
        "duracion_escuchada", "duracion_escucha", "completado", "fecha",
        "plataforma", "dispositivo", "contexto", "migrated",
    },
    "LIKED": {
        "reaccion", "intensidad", "fecha", "plataforma",
        "contexto", "migrated",
    },
    "COMMENTED": {
        "contenido", "likes", "fecha", "plataforma", "migrated",
    },
    "CONTAINS": {
        "orden", "posicion", "destacado", "timestamp", "fecha_agregado",
        "agregado_por", "migrated",
    },
    "CREATED": {
        "dispositivo", "ubicacion", "fecha_creacion", "migrated",
    },
    "CREATED_PLAYLIST": {
        "colaborativa", "numero_ediciones", "fecha", "migrated",
    },
    "INCLUDES": {
        "orden", "favorito", "fecha_agregado", "posicion", "migrated",
    },
    "BY": {
        "rol", "principal", "fecha_colaboracion", "migrated",
    },
    "BELONGS_TO": {
        "relevancia", "principal", "fecha_asignacion", "rol",
        "activo", "migrated",
    },
    "FOLLOWS_ARTIST": {
        "notificaciones", "interacciones", "fecha", "plataforma", "migrated",
    },
    "SAVED": {
        "veces_reproducida", "favorita", "fecha", "migrated",
    },
    "POSTED": {
        "fecha", "plataforma", "visible", "migrated",
    },
    "FEATURED_IN": {
        "fecha", "posicion", "activo", "migrated",
    },
    "COLLABORATED_WITH": {
        "fecha_colaboracion", "rol", "activo", "migrated",
    },
    "SHARED": {
        "fecha", "plataforma", "mensaje", "migrated",
    },
}

# Propiedades mutables por label de nodo
ALLOWED_NODE_PROPERTIES: dict[str, set[str]] = {
    "User": {
        "user_id", "username", "email", "premium", "generos_favoritos",
        "fecha_registro", "activo", "is_new_user", "migrated",
    },
    "Song": {
        "song_id", "titulo", "duracion", "popularidad", "idiomas",
        "fecha_lanzamiento", "migrated", "temp_field",
    },
    "Artist": {
        "artist_id", "nombre", "pais", "genero_principal", "activo",
        "anios_activo", "migrated",
    },
    "Post": {
        "post_id", "user_id", "caption", "tipo", "privacidad", "hashtags",
        "fecha", "is_ad", "migrated",
    },
    "Playlist": {
        "playlist_id", "nombre", "descripcion", "publica", "numero_canciones",
        "fecha_creacion", "is_featured", "migrated",
    },
    "Genre": {
        "genre_id", "nombre", "descripcion", "popularidad", "origen",
        "activo", "migrated",
    },
}

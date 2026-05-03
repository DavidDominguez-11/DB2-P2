// ─── Visual constants only — no mock data ──────────────────────────────────

export const LABEL_COLORS = {
  User:     '#38bdf8',
  Song:     '#34d399',
  Artist:   '#a78bfa',
  Post:     '#f5a623',
  Playlist: '#fb923c',
  Genre:    '#ff4d6d',
}

export const REL_COLORS = {
  FOLLOWS:          '#38bdf8',
  LISTENED:         '#34d399',
  BY:               '#a78bfa',
  BELONGS_TO:       '#ff4d6d',
  INCLUDES:         '#fb923c',
  CREATED_PLAYLIST: '#f5a623',
  FOLLOWS_ARTIST:   '#a78bfa',
  SAVED:            '#fbbf24',
  LIKED:            '#f472b6',
  COMMENTED:        '#94a3b8',
  CREATED:          '#e879f9',
  CONTAINS:         '#67e8f9',
}

export const LABEL_BADGE_COLORS = {
  User:     'sky',
  Song:     'neon',
  Artist:   'purple',
  Post:     'amber',
  Playlist: 'amber',
  Genre:    'rose',
}

export const ALL_LABELS = ['User', 'Song', 'Artist', 'Post', 'Playlist', 'Genre']

export const ALL_REL_TYPES = [
  'FOLLOWS', 'LISTENED', 'BY', 'BELONGS_TO',
  'INCLUDES', 'CREATED_PLAYLIST', 'LIKED',
  'COMMENTED', 'SAVED', 'FOLLOWS_ARTIST', 'CREATED', 'CONTAINS',
]

// ID field name per label
export const LABEL_ID_FIELD = {
  User:     'user_id',
  Song:     'song_id',
  Artist:   'artist_id',
  Post:     'post_id',
  Playlist: 'playlist_id',
  Genre:    'genre_id',
}

// Display name field per label
export const LABEL_NAME_FIELD = {
  User:     'username',
  Song:     'titulo',
  Artist:   'nombre',
  Post:     'caption',
  Playlist: 'nombre',
  Genre:    'nombre',
}

// Create form field definitions per label (matches OpenAPI schemas)
export const LABEL_FORM_FIELDS = {
  User: [
    { key: 'user_id',           type: 'text',     required: true,  label: 'user_id' },
    { key: 'username',          type: 'text',     required: true,  label: 'username' },
    { key: 'email',             type: 'email',    required: true,  label: 'email' },
    { key: 'fecha_registro',    type: 'date',     required: true,  label: 'fecha_registro' },
    { key: 'premium',           type: 'boolean',  required: false, label: 'premium' },
    { key: 'generos_favoritos', type: 'list',     required: false, label: 'generos_favoritos (coma-separados)' },
    { key: 'is_artist',         type: 'boolean',  required: false, label: 'is_artist' },
  ],
  Song: [
    { key: 'song_id',           type: 'text',     required: true,  label: 'song_id' },
    { key: 'titulo',            type: 'text',     required: true,  label: 'titulo' },
    { key: 'duracion',          type: 'number',   required: true,  label: 'duracion (min)' },
    { key: 'fecha_lanzamiento', type: 'date',     required: true,  label: 'fecha_lanzamiento' },
    { key: 'popularidad',       type: 'number',   required: false, label: 'popularidad' },
    { key: 'idiomas',           type: 'list',     required: false, label: 'idiomas (coma-separados)' },
  ],
  Artist: [
    { key: 'artist_id',        type: 'text',     required: true,  label: 'artist_id' },
    { key: 'nombre',           type: 'text',     required: true,  label: 'nombre' },
    { key: 'pais',             type: 'text',     required: true,  label: 'pais' },
    { key: 'genero_principal', type: 'text',     required: true,  label: 'genero_principal' },
    { key: 'activo',           type: 'boolean',  required: false, label: 'activo' },
    { key: 'anios_activo',     type: 'number',   required: false, label: 'anios_activo' },
  ],
  Post: [
    { key: 'post_id',    type: 'text',    required: true,  label: 'post_id' },
    { key: 'caption',    type: 'text',    required: true,  label: 'caption' },
    { key: 'fecha',      type: 'date',    required: true,  label: 'fecha' },
    { key: 'tipo',       type: 'text',    required: true,  label: 'tipo' },
    { key: 'privacidad', type: 'text',    required: false, label: 'privacidad' },
    { key: 'hashtags',   type: 'list',    required: false, label: 'hashtags (coma-separados)' },
    { key: 'is_ad',      type: 'boolean', required: false, label: 'is_ad' },
  ],
  Playlist: [
    { key: 'playlist_id',     type: 'text',    required: true,  label: 'playlist_id' },
    { key: 'nombre',          type: 'text',    required: true,  label: 'nombre' },
    { key: 'descripcion',     type: 'text',    required: true,  label: 'descripcion' },
    { key: 'fecha_creacion',  type: 'date',    required: true,  label: 'fecha_creacion' },
    { key: 'publica',         type: 'boolean', required: false, label: 'publica' },
    { key: 'numero_canciones',type: 'number',  required: false, label: 'numero_canciones' },
    { key: 'is_featured',     type: 'boolean', required: false, label: 'is_featured' },
  ],
  Genre: [
    { key: 'genre_id',    type: 'text',    required: true,  label: 'genre_id' },
    { key: 'nombre',      type: 'text',    required: true,  label: 'nombre' },
    { key: 'descripcion', type: 'text',    required: true,  label: 'descripcion' },
    { key: 'origen',      type: 'text',    required: true,  label: 'origen' },
    { key: 'popularidad', type: 'number',  required: false, label: 'popularidad' },
    { key: 'activo',      type: 'boolean', required: false, label: 'activo' },
  ],
}

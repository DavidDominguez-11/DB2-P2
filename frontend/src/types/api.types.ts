export interface GenericResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface AffectedResponse {
  success: boolean
  affected: number
  message: string
}

export interface User {
  user_id: string
  username: string
  email: string
  fecha_registro: string
  premium: boolean
  generos_favoritos?: string[]
  is_artist?: boolean
  [key: string]: unknown
}

export interface Song {
  song_id: string
  titulo: string
  duracion: number
  fecha_lanzamiento: string
  popularidad: number
  idiomas?: string[]
  [key: string]: unknown
}

export interface Playlist {
  playlist_id: string
  nombre: string
  descripcion: string
  fecha_creacion: string
  publica?: boolean
  numero_canciones?: number
  [key: string]: unknown
}

export interface Post {
  post_id: string
  caption: string
  fecha: string
  tipo: 'song' | 'playlist' | 'update' | 'event'
  privacidad: string
  hashtags?: string[]
  [key: string]: unknown
}

export interface Genre {
  genre_id: string
  nombre: string
  descripcion: string
  popularidad: number
  origen?: string
  activo?: boolean
  [key: string]: unknown
}

export interface Interaction {
  element_id: string
  from_label: string
  from_id: string
  to_label: string
  to_id: string
  rel_type: string
  properties: Record<string, unknown>
}

export type Entity = 'users' | 'songs' | 'playlists' | 'posts' | 'genres'
export type EntityLabel = 'User' | 'Song' | 'Playlist' | 'Post' | 'Genre'

export const ENTITY_LABELS: Record<Entity, EntityLabel> = {
  users: 'User',
  songs: 'Song',
  playlists: 'Playlist',
  posts: 'Post',
  genres: 'Genre',
}

export const REL_TYPES = [
  'LISTENED',
  'FOLLOWS',
  'LIKED',
  'CONTAINS',
  'POSTED',
  'BELONGS_TO',
  'FEATURED_IN',
  'COLLABORATED_WITH',
] as const

export type RelType = (typeof REL_TYPES)[number]

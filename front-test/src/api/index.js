// ─── Base config ─────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:8000/api/v1'
const TIMEOUT_MS = 15000

// ─── Error extraction ───────────────────────────────────────────────────────────
function extractErrorMessage(data, fallback) {
  const msg =
    data?.detail?.[0]?.msg ||
    data?.detail ||
    data?.message ||
    fallback ||
    'Error de red'
  return typeof msg === 'string' ? msg : JSON.stringify(msg)
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, { params, body, headers: extraHeaders, baseOverride } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Build URL with optional query params
  const base = baseOverride !== undefined ? baseOverride : BASE_URL
  let url = `${base}${path}`
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach(item => qs.append(k, item))
      else if (v !== undefined && v !== null) qs.append(k, v)
    }
    url += `?${qs.toString()}`
  }

  // Build headers & body
  const headers = { ...extraHeaders }
  let fetchBody
  if (body instanceof FormData) {
    fetchBody = body // browser sets Content-Type with boundary automatically
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: fetchBody,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    const msg = err.name === 'AbortError' ? 'La petición superó el tiempo límite' : 'Error de red'
    throw new Error(msg)
  }
  clearTimeout(timer)

  // Parse response body (JSON when possible, otherwise text)
  let data
  const ct = response.headers.get('content-type') || ''
  try {
    data = ct.includes('application/json') ? await response.json() : await response.text()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `HTTP ${response.status}`))
  }

  // Returns { data, status, headers }
  return { data, status: response.status, headers: response.headers }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────
const api = {
  get:    (path, opts)       => request('GET',    path, opts),
  post:   (path, body, opts) => request('POST',   path, { ...opts, body }),
  patch:  (path, body, opts) => request('PATCH',  path, { ...opts, body }),
  delete: (path, opts)       => request('DELETE', path, opts),
}

export default api

// ═══════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════
export const listUsers = (params = {}) =>
  api.get('/users/', { params })

export const aggregateUsers = (params = {}) =>
  api.get('/users/aggregate', { params })

export const getUser = (user_id) =>
  api.get(`/users/${user_id}`)

export const createUser = (data) =>
  api.post('/users/', data)

export const updateUser = (user_id, data) =>
  api.patch(`/users/${user_id}`, data)

export const deleteUser = (user_id) =>
  api.delete(`/users/${user_id}`)

export const removeUserProperties = (user_id, properties) =>
  api.delete(`/users/${user_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// SONGS
// ═══════════════════════════════════════════════════════════════════════════
export const listSongs = (params = {}) =>
  api.get('/songs/', { params })

export const aggregateSongs = (params = {}) =>
  api.get('/songs/aggregate', { params })

export const getSong = (song_id) =>
  api.get(`/songs/${song_id}`)

export const createSong = (data) =>
  api.post('/songs/', data)

export const updateSong = (song_id, data) =>
  api.patch(`/songs/${song_id}`, data)

export const deleteSong = (song_id) =>
  api.delete(`/songs/${song_id}`)

export const removeSongProperties = (song_id, properties) =>
  api.delete(`/songs/${song_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════════════════════
export const listPosts = (params = {}) =>
  api.get('/posts/', { params })

export const aggregatePosts = (params = {}) =>
  api.get('/posts/aggregate', { params })

export const getPost = (post_id) =>
  api.get(`/posts/${post_id}`)

export const createPost = (data) =>
  api.post('/posts/', data)

export const updatePost = (post_id, data) =>
  api.patch(`/posts/${post_id}`, data)

export const deletePost = (post_id) =>
  api.delete(`/posts/${post_id}`)

export const removePostProperties = (post_id, properties) =>
  api.delete(`/posts/${post_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// ARTISTS
// ═══════════════════════════════════════════════════════════════════════════
export const listArtists = (params = {}) =>
  api.get('/artists/', { params })

export const aggregateArtists = (params = {}) =>
  api.get('/artists/aggregate', { params })

export const getArtist = (artist_id) =>
  api.get(`/artists/${artist_id}`)

export const createArtist = (data) =>
  api.post('/artists/', data)

export const updateArtist = (artist_id, data) =>
  api.patch(`/artists/${artist_id}`, data)

export const deleteArtist = (artist_id) =>
  api.delete(`/artists/${artist_id}`)

export const removeArtistProperties = (artist_id, properties) =>
  api.delete(`/artists/${artist_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// PLAYLISTS
// ═══════════════════════════════════════════════════════════════════════════
export const listPlaylists = (params = {}) =>
  api.get('/playlists/', { params })

export const aggregatePlaylists = (params = {}) =>
  api.get('/playlists/aggregate', { params })

export const getPlaylist = (playlist_id) =>
  api.get(`/playlists/${playlist_id}`)

export const createPlaylist = (data) =>
  api.post('/playlists/', data)

export const updatePlaylist = (playlist_id, data) =>
  api.patch(`/playlists/${playlist_id}`, data)

export const deletePlaylist = (playlist_id) =>
  api.delete(`/playlists/${playlist_id}`)

export const removePlaylistProperties = (playlist_id, properties) =>
  api.delete(`/playlists/${playlist_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// GENRES
// ═══════════════════════════════════════════════════════════════════════════
export const listGenres = (params = {}) =>
  api.get('/genres/', { params })

export const aggregateGenres = (params = {}) =>
  api.get('/genres/aggregate', { params })

export const getGenre = (genre_id) =>
  api.get(`/genres/${genre_id}`)

export const createGenre = (data) =>
  api.post('/genres/', data)

export const updateGenre = (genre_id, data) =>
  api.patch(`/genres/${genre_id}`, data)

export const deleteGenre = (genre_id) =>
  api.delete(`/genres/${genre_id}`)

export const removeGenreProperties = (genre_id, properties) =>
  api.delete(`/genres/${genre_id}/properties`, { params: { properties } })

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIONS (relationships)
// ═══════════════════════════════════════════════════════════════════════════
export const createInteraction = (data) =>
  api.post('/interactions/', data)
  // { from_label, from_id, to_label, to_id, rel_type, properties? }

export const listInteractionsByType = (rel_type, params = {}) =>
  api.get('/interactions/by-type', { params: { rel_type, ...params } })

export const getInteraction = (element_id) =>
  api.get(`/interactions/${element_id}`)

export const updateInteraction = (element_id, properties) =>
  api.patch(`/interactions/${element_id}`, { properties })

export const deleteInteraction = (element_id) =>
  api.delete(`/interactions/${element_id}`)

export const removeInteractionProperties = (element_id, property_names) =>
  api.delete(`/interactions/${element_id}/properties`, { body: { property_names } })

export const bulkUpdateInteractions = (data) =>
  api.patch('/interactions/bulk/update', data)
  // { rel_type, filter_property, filter_value, update_data }

export const bulkRemoveInteractionProperty = (data) =>
  api.delete('/interactions/bulk/properties', { body: data })
  // { rel_type, property_to_remove, filter_property?, filter_value? }

export const bulkDeleteInteractions = (data) =>
  api.delete('/interactions/bulk/delete', { body: data })
  // { rel_type, filter_property, filter_value }

// ═══════════════════════════════════════════════════════════════════════════
// BULK — NODES
// ═══════════════════════════════════════════════════════════════════════════
export const bulkUpdateNodes = (data) =>
  api.patch('/bulk/nodes', data)
  // { label, filter_property, filter_value, update_data }

export const bulkDeleteNodes = (data) =>
  api.delete('/bulk/nodes', { body: data })
  // { label, filter_property, filter_value }

export const bulkRemoveNodeProperty = (data) =>
  api.delete('/bulk/nodes/properties', { body: data })
  // { label, property_to_remove, filter_property?, filter_value? }

export const uploadCSV = (label, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/bulk/csv/${label}`, form)
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK — MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════
export const getGraphStats = () =>
  api.get('/bulk/maintenance/stats')

export const checkConnectivity = () =>
  api.get('/bulk/maintenance/connectivity')

export const createConstraints = () =>
  api.post('/bulk/maintenance/constraints')

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
export const getRecommendations = (user_id, limit = 10) =>
  api.get(`/analytics/recommendations/${user_id}`, { params: { limit } })

export const getSimilarUsers = (user_id, limit = 10) =>
  api.get(`/analytics/similar-users/${user_id}`, { params: { limit } })

export const getInfluence = (params = {}) =>
  api.get('/analytics/influence', { params })

export const getPopularSongs = (params = {}) =>
  api.get('/analytics/popular-songs', { params })

export const getGenreDistribution = () =>
  api.get('/analytics/genre-distribution')

export const getUserActivity = (user_id) =>
  api.get(`/analytics/user-activity/${user_id}`)

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════════════════
export const healthCheck = () =>
  api.get('/health', { baseOverride: '' })

export const EP = {
  users:            '/api/v1/users/',
  usersAggregate:   '/api/v1/users/aggregate',
  user:             (id: string) => `/api/v1/users/${id}`,
  userProperties:   (id: string) => `/api/v1/users/${id}/properties`,

  songs:            '/api/v1/songs/',
  songsAggregate:   '/api/v1/songs/aggregate',
  song:             (id: string) => `/api/v1/songs/${id}`,
  songProperties:   (id: string) => `/api/v1/songs/${id}/properties`,

  playlists:        '/api/v1/playlists/',
  playlistsAgg:     '/api/v1/playlists/aggregate',
  playlist:         (id: string) => `/api/v1/playlists/${id}`,
  playlistProps:    (id: string) => `/api/v1/playlists/${id}/properties`,
  playlistsByUser:  (userId: string) => `/api/v1/playlists/by-user/${userId}`,
  playlistSongs:    (id: string) => `/api/v1/playlists/${id}/songs`,

  posts:            '/api/v1/posts/',
  postsAgg:         '/api/v1/posts/aggregate',
  post:             (id: string) => `/api/v1/posts/${id}`,
  postProps:        (id: string) => `/api/v1/posts/${id}/properties`,
  postComments:     (id: string) => `/api/v1/posts/${id}/comments`,

  genres:           '/api/v1/genres/',
  genresAgg:        '/api/v1/genres/aggregate',
  genre:            (id: string) => `/api/v1/genres/${id}`,
  genreProps:       (id: string) => `/api/v1/genres/${id}/properties`,

  artists:          '/api/v1/artists/',
  artistsAgg:       '/api/v1/artists/aggregate',
  artist:           (id: string) => `/api/v1/artists/${id}`,
  artistProps:      (id: string) => `/api/v1/artists/${id}/properties`,

  interactions:     '/api/v1/interactions/',
  interaction:      (id: string) => `/api/v1/interactions/${id}`,
  interactionProps: (id: string) => `/api/v1/interactions/${id}/properties`,
  interactionsByType: '/api/v1/interactions/by-type',

  bulkNodes:        '/api/v1/bulk/nodes',
  bulkNodeProps:    '/api/v1/bulk/nodes/properties',
  bulkRels:         '/api/v1/bulk/relationships',
  bulkRelProps:     '/api/v1/bulk/relationships/properties',
  bulkRelUpdate:    '/api/v1/interactions/bulk/update',
  bulkRelDelete:    '/api/v1/interactions/bulk/delete',
  bulkRelRemoveProps: '/api/v1/interactions/bulk/properties',

  analyticsRecs:    (id: string) => `/api/v1/analytics/recommendations/${id}`,
  analyticsSimilar: (id: string) => `/api/v1/analytics/similar-users/${id}`,
  analyticsInfluence: '/api/v1/analytics/influence',
  analyticsPopularSongs: '/api/v1/analytics/popular-songs',
  analyticsGenreDistribution: '/api/v1/analytics/genre-distribution',
  analyticsUserActivity: (id: string) => `/api/v1/analytics/user-activity/${id}`,

  bulkCsv:                 (label: string) => `/api/v1/bulk/csv/${label}`,
  maintenanceStats:        '/api/v1/bulk/maintenance/stats',
  maintenanceConnectivity: '/api/v1/bulk/maintenance/connectivity',
  maintenanceConstraints:  '/api/v1/bulk/maintenance/constraints',

  nodes:     '/api/v1/nodes',
  nodeById:  (id: string) => `/api/v1/nodes/${id}`,
  nodeLabels:(id: string) => `/api/v1/nodes/${id}/labels`,
  cypherQuery: '/api/v1/cypher/query',
} as const

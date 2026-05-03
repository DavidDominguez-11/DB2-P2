# ParaMetrix – Frontend

Red social de descubrimiento musical construida sobre Neo4j.

## Stack
- React 18 + Vite
- Tailwind CSS
- react-force-graph-2d (visualización del grafo)
- React Router v6
- Axios (con mock interceptor)

## Instalación rápida

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Feed social — publicaciones de conexiones en el grafo |
| `/discover` | Recomendaciones (Jaccard Similarity), trending, géneros, artistas |
| `/explorer` | Visualizador interactivo del grafo con react-force-graph-2d |
| `/nodes` | CRUD completo de nodos (User, Song, Artist, Genre, Playlist) |
| `/admin` | Operaciones bulk, creación de relaciones, carga de CSV |

## Datos mock

Todos los datos están en `src/utils/mockData.js`. El archivo `src/api/index.js`
contiene un **interceptor de Axios** que responde con mock data cuando el backend
no está disponible.

## Conectar al backend real

1. Levanta tu backend en `http://localhost:3000`
2. Abre `src/api/index.js`
3. Elimina el bloque `api.interceptors.response.use(...)` completo
4. Los endpoints esperados son:

```
GET    /api/v1/nodes/users
GET    /api/v1/nodes/songs
POST   /api/v1/nodes/:label
PATCH  /api/v1/nodes/:label/:id
DELETE /api/v1/nodes/:label/:id
PATCH  /api/v1/bulk/nodes
DELETE /api/v1/bulk/nodes/properties
PATCH  /api/v1/bulk/relationships
DELETE /api/v1/bulk/relationships/properties
POST   /api/v1/relationships
DELETE /api/v1/relationships/:id
GET    /api/v1/feed?userId=
POST   /api/v1/posts/:id/like
GET    /api/v1/graph
GET    /api/v1/analytics/recommendations?userId=
GET    /api/v1/stats
POST   /api/v1/import/csv
```

## Estructura de directorios

```
src/
├── api/              # Axios + mock interceptor
├── components/
│   ├── common/       # Button, Input, Modal, Badge, Toast, etc.
│   ├── layout/       # Sidebar
│   └── music/        # SongCard, ArtistCard, PostCard
├── pages/            # Home, Discover, Explorer, Nodes, Admin
├── store/            # Context API (usuario, toasts, filtros)
└── utils/            # mockData.js, neo4jParser.js
```

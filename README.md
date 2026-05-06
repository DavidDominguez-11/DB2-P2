# DB2-P2 — ParaMetrix

Red social musical construida sobre **Neo4j** como base de datos de grafos. Proyecto 2 del curso Bases de Datos 2.

## Stack

| Capa | Tecnología |
|------|------------|
| Base de datos | Neo4j AuraDB 5.x |
| Backend | FastAPI 0.115 + Python 3.12 |
| Frontend | React 19 + TypeScript 6 + Vite |
| Estado del servidor | TanStack Query v5 |
| Estado del cliente | Zustand 5 |
| Estilos | Tailwind CSS 3 |
| Tablas / Gráficas | TanStack Table v8 + Recharts 3 |

---

## Estructura del proyecto

```
DB2-P2/
├── backend/
│   ├── api/v1/endpoints/   # Rutas por entidad
│   ├── core/               # Config y conexión a Neo4j
│   ├── crud/               # Lógica de acceso a la BD
│   ├── models/             # Labels y tipos de relación
│   ├── schemas/            # Modelos Pydantic
│   ├── services/           # GDS y mantenimiento
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/            # Clientes Axios por entidad
        ├── components/     # UI reutilizable
        ├── hooks/          # Hooks de React Query
        ├── pages/          # Vistas por sección
        ├── store/          # Zustand stores
        └── types/          # Interfaces TypeScript
```

---

## Modelo de datos

### Nodos

| Label | Propiedades clave |
|-------|-------------------|
| `User` | user_id, username, email, premium, generos_favoritos |
| `Song` | song_id, titulo, duracion, popularidad, idiomas |
| `Playlist` | playlist_id, nombre, publica, numero_canciones |
| `Post` | post_id, caption, tipo, privacidad, hashtags |
| `Genre` | genre_id, nombre, popularidad, origen |
| `Artist` | (label adicional sobre User) |

Los nodos pueden tener múltiples labels: un `User` con `is_artist=true` recibe también el label `Artist`; un `Post` con `is_ad=true` recibe el label `Ad`.

### Relaciones principales

| Tipo | De → A | Propiedades |
|------|--------|-------------|
| `LISTENED` | User → Song | fecha, duracion_escucha, plataforma |
| `FOLLOWS` | User → User | fecha |
| `LIKED` | User → Song/Post/Genre | fecha |
| `CONTAINS` | Playlist → Song | orden |
| `POSTED` | User → Post | fecha |
| `BELONGS_TO` | Song → Genre | — |
| `COLLABORATED_WITH` | Artist → Artist/Song | — |

---

## Setup

### Requisitos previos

- Python 3.12+
- Node.js 20+
- Cuenta en [Neo4j AuraDB](https://neo4j.com/cloud/aura/) (tier gratuito funciona)

### Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de AuraDB

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

La API queda disponible en `http://localhost:8000`.  
Documentación interactiva: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

---

## Variables de entorno

Ver [backend/.env.example](backend/.env.example) para la lista completa.

| Variable | Descripción |
|----------|-------------|
| `NEO4J_URI` | URI de conexión (`neo4j+s://...`) |
| `NEO4J_USERNAME` | Usuario de AuraDB |
| `NEO4J_PASSWORD` | Contraseña de AuraDB |
| `NEO4J_DATABASE` | Nombre de la base de datos |
| `FRONTEND_URL` | URL del frontend para CORS (default: `http://localhost:5173`) |

---

## API — Endpoints principales

Prefijo base: `/api/v1`

### Entidades CRUD (Users, Songs, Playlists, Posts, Genres, Artists)

Todas siguen el mismo patrón:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/{entity}/` | Crear nodo |
| `GET` | `/{entity}/` | Listar con paginación (`skip`, `limit`) |
| `GET` | `/{entity}/aggregate` | Agregar (`group_by`, `agg_field`, `agg_func`) |
| `GET` | `/{entity}/{id}` | Obtener nodo con sus relaciones |
| `PATCH` | `/{entity}/{id}` | Actualizar propiedades |
| `DELETE` | `/{entity}/{id}/properties` | Eliminar propiedades específicas |
| `DELETE` | `/{entity}/{id}` | Eliminar nodo |

### Interacciones (Relaciones)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/interactions/` | Crear relación (mínimo 3 propiedades) |
| `GET` | `/interactions/{id}` | Obtener relación por element_id |
| `GET` | `/interactions/by-type` | Filtrar por tipo (`?rel_type=LISTENED`) |
| `PATCH` | `/interactions/{id}` | Actualizar propiedades |
| `DELETE` | `/interactions/{id}` | Eliminar relación |
| `PATCH` | `/interactions/bulk/update` | Actualización masiva |
| `DELETE` | `/interactions/bulk/delete` | Eliminación masiva |

### Nodos multi-label

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/nodes` | Crear nodo con labels arbitrarios |
| `GET` | `/nodes/search` | Búsqueda avanzada con operadores de filtro |
| `PATCH` | `/nodes/{id}/labels` | Agregar o quitar labels |

Operadores de filtro soportados: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `contains`, `starts_with`, `ends_with`, `exists`, `not_exists`.

### Operaciones masivas (Bulk)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `PATCH` | `/bulk/nodes` | Actualizar múltiples nodos por label + filtro |
| `DELETE` | `/bulk/nodes/properties` | Eliminar propiedad de múltiples nodos |
| `DELETE` | `/bulk/nodes` | Eliminar múltiples nodos |
| `POST` | `/bulk/csv/{label}` | Importar nodos desde CSV |

### Cypher directo

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/cypher/query` | Ejecutar query Cypher arbitrario |

Operaciones bloqueadas: `DROP`, `APOC schema`, `db.clearquerycaches`.

---

## Funcionalidades del frontend

- **Home** — Feed de posts con comentarios e interacciones
- **Explore** — Búsqueda de canciones, géneros y usuarios
- **Playlists** — Gestión completa de playlists
- **Analytics** — Gráficas de distribución, rankings de influencia y recomendaciones personalizadas
- **Graph Manager** — Panel avanzado para manipular el grafo directamente:
  - Crear y explorar nodos
  - Gestionar propiedades (individual y masivo)
  - Construir y gestionar relaciones
  - Consola Cypher con historial

---

## Tecnologías clave del backend

- **FastAPI** con soporte async nativo
- **Neo4j Python Driver 5** con `AsyncSession`
- **Pydantic v2** para validación de esquemas
- **Graph Data Science (GDS)** para similitud y recomendaciones

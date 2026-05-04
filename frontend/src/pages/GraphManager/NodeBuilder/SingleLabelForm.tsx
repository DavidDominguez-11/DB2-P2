import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCreateUser, useUpdateUser } from '../../../hooks/useUsers'
import { useCreateSong, useUpdateSong } from '../../../hooks/useSongs'
import { useCreatePlaylist, useUpdatePlaylist } from '../../../hooks/usePlaylists'
import { useCreatePost, useUpdatePost } from '../../../hooks/usePosts'
import { useCreateGenre, useUpdateGenre } from '../../../hooks/useGenres'
import { usersApi } from '../../../api/users.api'
import { songsApi } from '../../../api/songs.api'
import { playlistsApi } from '../../../api/playlists.api'
import { postsApi } from '../../../api/posts.api'
import { genresApi } from '../../../api/genres.api'
import JsonViewer from '../../../components/common/JsonViewer'

type EntityType = 'User' | 'Song' | 'Playlist' | 'Post' | 'Genre'

const ID_KEYS: Record<EntityType, string> = {
  User: 'user_id',
  Song: 'song_id',
  Playlist: 'playlist_id',
  Post: 'post_id',
  Genre: 'genre_id',
}

// Clave del array en la respuesta de la API de listado
const RESPONSE_KEYS: Record<EntityType, string> = {
  User: 'users',
  Song: 'songs',
  Playlist: 'playlists',
  Post: 'posts',
  Genre: 'genres',
}

const DATE_KEYS: Record<EntityType, string[]> = {
  User: ['fecha_registro'],
  Song: ['fecha_lanzamiento'],
  Playlist: ['fecha_creacion'],
  Post: ['fecha'],
  Genre: [],
}

const LIST_APIS = {
  User: (skip: number, limit: number) => usersApi.list({ skip, limit }),
  Song: (skip: number, limit: number) => songsApi.list({ skip, limit }),
  Playlist: (skip: number, limit: number) => playlistsApi.list({ skip, limit }),
  Post: (skip: number, limit: number) => postsApi.list({ skip, limit }),
  Genre: (skip: number, limit: number) => genresApi.list({ skip, limit }),
}

const today = () => new Date().toISOString().split('T')[0]

const ENTITY_FIELDS: Record<EntityType, { key: string; label: string; type: string; required?: boolean }[]> = {
  User: [
    { key: 'user_id', label: 'User ID', type: 'text' },
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'fecha_registro', label: 'Fecha de Registro', type: 'date' },
    { key: 'premium', label: 'Premium', type: 'checkbox' },
    { key: 'is_artist', label: 'Es Artista', type: 'checkbox' },
    { key: 'generos_favoritos', label: 'Géneros Favoritos (coma)', type: 'text' },
  ],
  Song: [
    { key: 'song_id', label: 'Song ID', type: 'text' },
    { key: 'titulo', label: 'Título', type: 'text', required: true },
    { key: 'duracion', label: 'Duración (seg)', type: 'number', required: true },
    { key: 'fecha_lanzamiento', label: 'Fecha Lanzamiento', type: 'date' },
    { key: 'popularidad', label: 'Popularidad', type: 'number', required: true },
    { key: 'idiomas', label: 'Idiomas (coma)', type: 'text' },
  ],
  Genre: [
    { key: 'genre_id', label: 'Genre ID', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { key: 'popularidad', label: 'Popularidad', type: 'number', required: true },
    { key: 'origen', label: 'Origen', type: 'text', required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ],
  Playlist: [
    { key: 'playlist_id', label: 'Playlist ID', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { key: 'fecha_creacion', label: 'Fecha Creación', type: 'date' },
    { key: 'publica', label: 'Pública', type: 'checkbox' },
    { key: 'numero_canciones', label: 'Nº Canciones', type: 'number' },
    { key: 'is_featured', label: 'Destacada', type: 'checkbox' },
  ],
  Post: [
    { key: 'post_id', label: 'Post ID', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text', required: true },
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'tipo', label: 'Tipo', type: 'select' },
    { key: 'privacidad', label: 'Privacidad', type: 'select' },
    { key: 'hashtags', label: 'Hashtags (coma)', type: 'text' },
    { key: 'is_ad', label: 'Es Anuncio', type: 'checkbox' },
  ],
}

export default function SingleLabelForm() {
  const [entity, setEntity] = useState<EntityType>('User')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [nextId, setNextId] = useState<string>('...')
  const [loadingId, setLoadingId] = useState(false)

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const createSong = useCreateSong()
  const updateSong = useUpdateSong()
  const createPlaylist = useCreatePlaylist()
  const updatePlaylist = useUpdatePlaylist()
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  const createGenre = useCreateGenre()
  const updateGenre = useUpdateGenre()

  const idKey = ID_KEYS[entity]
  const providedId = String(formData[idKey] ?? '').trim()
  const isUpdate = providedId !== ''

  // Calcula el siguiente ID paginando de a 100 (límite del backend) hasta agotar todos los nodos
  const fetchNextId = async (ent: EntityType) => {
    setLoadingId(true)
    try {
      const PAGE = 100
      const key = ID_KEYS[ent]
      const respKey = RESPONSE_KEYS[ent]
      let maxId = 0
      let skip = 0

      while (true) {
        const data = await LIST_APIS[ent](skip, PAGE)
        const nodes: Record<string, unknown>[] =
          data?.[respKey] ?? (Array.isArray(data) ? data : [])

        for (const node of nodes) {
          const val = Number(node[key])
          if (!isNaN(val) && val > maxId) maxId = val
        }

        if (nodes.length < PAGE) break   // última página
        skip += PAGE
      }

      setNextId(String(maxId + 1))
    } catch {
      setNextId('1')
    } finally {
      setLoadingId(false)
    }
  }

  useEffect(() => {
    fetchNextId(entity)
  }, [entity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fields = ENTITY_FIELDS[entity]
    const payload: Record<string, unknown> = {}

    fields.forEach(({ key, type }) => {
      const val = formData[key]
      if (type === 'checkbox') payload[key] = Boolean(val)
      else if (type === 'number') payload[key] = val !== undefined && val !== '' ? Number(val) : undefined
      else if (key === 'generos_favoritos' || key === 'idiomas' || key === 'hashtags') {
        payload[key] = val ? String(val).split(',').map((s) => s.trim()).filter(Boolean) : []
      } else {
        payload[key] = val
      }
    })

    // Auto-ID incremental si el campo está vacío
    if (!isUpdate) {
      payload[idKey] = nextId
    }

    // Auto-fecha: usa hoy si el campo está vacío
    DATE_KEYS[entity].forEach((dateKey) => {
      if (!payload[dateKey] || payload[dateKey] === '') {
        payload[dateKey] = today()
      }
    })

    if (isUpdate) {
      const { [idKey]: _, ...updatePayload } = payload
      const updateMap = {
        User: updateUser, Song: updateSong, Playlist: updatePlaylist,
        Post: updatePost, Genre: updateGenre,
      }[entity]
      updateMap.mutate(
        { id: providedId, data: updatePayload as Record<string, unknown> },
        {
          onSuccess: (data) => {
            setResult(data)
            toast.success(`${entity} actualizado`)
          },
        }
      )
    } else {
      const createMap = {
        User: createUser, Song: createSong, Playlist: createPlaylist,
        Post: createPost, Genre: createGenre,
      }[entity]
      createMap.mutate(payload as Record<string, unknown>, {
        onSuccess: (data) => {
          setResult(data)
          toast.success(`${entity} creado con ID ${nextId}`)
          // Recalcula el siguiente ID tras crear
          fetchNextId(entity)
        },
      })
    }
  }

  const anyPending = [
    createUser, updateUser, createSong, updateSong,
    createPlaylist, updatePlaylist, createPost, updatePost,
    createGenre, updateGenre,
  ].some((m) => m.isPending)

  const fields = ENTITY_FIELDS[entity]

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <div className="mb-4">
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-2 block">Tipo de Entidad</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(ENTITY_FIELDS) as EntityType[]).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setEntity(e); setFormData({}); setResult(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Banner de modo */}
        <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs border ${isUpdate ? 'bg-[#00E5CC]/10 border-[#00E5CC]/30 text-[#00E5CC]' : 'bg-[#7C6FFF]/10 border-[#7C6FFF]/30 text-[#7C6FFF]'}`}>
          <span>{isUpdate ? '✏️' : '✨'}</span>
          <span>
            {isUpdate
              ? `Modo ACTUALIZAR — modificando ${entity} con ID: "${providedId}"`
              : `Modo CREAR — ID siguiente: ${loadingId ? 'calculando...' : nextId}`}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, type, required }) => {
              const isIdField = key === idKey
              const isDateField = DATE_KEYS[entity].includes(key)
              return (
                <div key={key}>
                  <label className="text-xs text-[#8888AA] mb-1 block">
                    {label}
                    {required && ' *'}
                    {isIdField && (
                      <span className="ml-1 text-[#44445A]">
                        (vacío = {loadingId ? '...' : nextId})
                      </span>
                    )}
                    {isDateField && !isIdField && (
                      <span className="ml-1 text-[#44445A]">(vacío = hoy)</span>
                    )}
                  </label>
                  {type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[key])}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="accent-[#7C6FFF]"
                      />
                      <span className="text-xs text-[#8888AA]">{label}</span>
                    </label>
                  ) : type === 'select' ? (
                    <select
                      value={String(formData[key] ?? '')}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]"
                    >
                      {key === 'tipo' && ['song', 'playlist', 'update', 'event'].map((o) => <option key={o} value={o}>{o}</option>)}
                      {key === 'privacidad' && ['public', 'private', 'friends'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={String(formData[key] ?? '')}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      required={required}
                      placeholder={
                        isIdField
                          ? `Dejar vacío → auto: ${loadingId ? '...' : nextId}`
                          : isDateField
                            ? `Vacío → ${today()}`
                            : ''
                      }
                      className={`w-full bg-[#090910] border rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none transition-colors ${isIdField ? 'border-[#7C6FFF]/40 focus:border-[#7C6FFF]' : 'border-[#252535] focus:border-[#7C6FFF]'}`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={anyPending || loadingId}
              className={`px-6 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 font-medium text-white ${isUpdate ? 'bg-[#00E5CC] hover:bg-teal-400 !text-black' : 'bg-[#7C6FFF] hover:bg-violet-500'}`}
            >
              {anyPending ? 'Procesando...' : isUpdate ? `✏️ Actualizar ${entity}` : `✨ Crear ${entity} (ID: ${nextId})`}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className={`bg-[#16161F] border rounded-xl p-5 ${isUpdate ? 'border-[#00E5CC]/30' : 'border-[#22D3A0]/30'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${isUpdate ? 'text-[#00E5CC]' : 'text-[#22D3A0]'}`}>
            Respuesta del servidor
          </h4>
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

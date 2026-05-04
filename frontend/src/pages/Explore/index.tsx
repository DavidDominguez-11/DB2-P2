import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/common/DataTable'
import { useSongs } from '../../hooks/useSongs'
import { useGenres } from '../../hooks/useGenres'
import { useUsers } from '../../hooks/useUsers'
import { formatDate, formatDuration } from '../../utils/formatters'

const TABS = ['songs', 'genres', 'users'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = { songs: '🎵 Canciones', genres: '🎸 Géneros', users: '👤 Usuarios' }

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as Tab) ?? 'songs'
  const [skip, setSkip] = useState(0)
  const limit = 25

  const setTab = (t: Tab) => { setSearchParams({ tab: t }); setSkip(0) }

  const songs = useSongs({ skip, limit })
  const genres = useGenres({ skip, limit })
  const users = useUsers({ skip, limit })

  const SONG_COLS = [
    { key: 'song_id', header: 'ID', sortable: true },
    { key: 'titulo', header: 'Título', sortable: true },
    { key: 'duracion', header: 'Duración', render: (r: Record<string, unknown>) => formatDuration(Number(r.duracion ?? 0)), sortable: true },
    { key: 'popularidad', header: 'Popularidad', sortable: true },
    { key: 'fecha_lanzamiento', header: 'Lanzamiento', render: (r: Record<string, unknown>) => r.fecha_lanzamiento ? formatDate(String(r.fecha_lanzamiento)) : '-' },
  ]

  const GENRE_COLS = [
    { key: 'genre_id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'popularidad', header: 'Popularidad', sortable: true },
    { key: 'origen', header: 'Origen' },
  ]

  const USER_COLS = [
    { key: 'user_id', header: 'ID', sortable: true },
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'premium', header: 'Premium', render: (r: Record<string, unknown>) => r.premium ? '⭐ Sí' : 'No' },
    { key: 'fecha_registro', header: 'Registro', render: (r: Record<string, unknown>) => r.fecha_registro ? formatDate(String(r.fecha_registro)) : '-' },
  ]

  const loading = tab === 'songs' ? songs.isLoading : tab === 'genres' ? genres.isLoading : users.isLoading
  const rawData = tab === 'songs' ? songs.data : tab === 'genres' ? genres.data : users.data
  const data: Record<string, unknown>[] =
    tab === 'songs' ? (rawData?.songs ?? (Array.isArray(rawData) ? rawData : []))
    : tab === 'genres' ? (rawData?.genres ?? (Array.isArray(rawData) ? rawData : []))
    : (rawData?.users ?? (Array.isArray(rawData) ? rawData : []))

  const cols = tab === 'songs' ? SONG_COLS : tab === 'genres' ? GENRE_COLS : USER_COLS
  const keyField = tab === 'songs' ? 'song_id' : tab === 'genres' ? 'genre_id' : 'user_id'

  return (
    <div>
      <PageHeader title="Explorar" subtitle="Descubre canciones, géneros y usuarios" />

      <div className="flex gap-1 mb-6 bg-[#111118] border border-[#252535] rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              tab === t ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <DataTable data={data} columns={cols} loading={loading} keyField={keyField} />

      <div className="flex gap-3 mt-4">
        <button disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - limit))} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors">← Anterior</button>
        <span className="px-4 py-2 text-sm text-[#44445A]">Offset: {skip}</span>
        <button disabled={data.length < limit} onClick={() => setSkip(skip + limit)} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors">Siguiente →</button>
      </div>
    </div>
  )
}

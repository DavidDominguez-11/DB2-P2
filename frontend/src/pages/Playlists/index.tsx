import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import PlaylistCard from './PlaylistCard'
import CreatePlaylistModal from './CreatePlaylistModal'
import PlaylistDetail from './PlaylistDetail'
import { usePlaylists, useDeletePlaylist } from '../../hooks/usePlaylists'
import { type Playlist } from '../../types/api.types'
import api from '../../api/client'
import { EP } from '../../api/endpoints'

export default function Playlists() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Playlist | null>(null)

  // Búsqueda por user_id
  const [userInput, setUserInput] = useState('')
  const [activeUser, setActiveUser] = useState('')

  const { data: allData, isLoading: allLoading } = usePlaylists()
  const deletePlaylist = useDeletePlaylist()

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['playlists-by-user', activeUser],
    queryFn: () =>
      api
        .get(`${EP.playlists}by-user/${activeUser}`)
        .then((r) => r.data),
    enabled: !!activeUser,
  })

  const isFiltered = !!activeUser
  const isLoading = isFiltered ? userLoading : allLoading
  const playlists: Record<string, unknown>[] = isFiltered
    ? (userData?.playlists ?? [])
    : (allData?.playlists ?? (Array.isArray(allData) ? allData : []))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveUser(userInput.trim())
  }

  const clearSearch = () => {
    setUserInput('')
    setActiveUser('')
  }

  return (
    <div>
      <PageHeader
        title="Playlists"
        subtitle="Gestiona tus colecciones de canciones"
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors font-medium"
          >
            + Nueva Playlist
          </button>
        }
      />

      {/* Buscador por User ID */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] text-sm">👤</span>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Buscar por User ID del creador..."
            className="w-full bg-[#16161F] border border-[#252535] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
        >
          Buscar
        </button>
        {activeUser && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-3 py-2 border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] text-sm transition-colors"
          >
            ✕ Todos
          </button>
        )}
      </form>

      {/* Badge filtro activo */}
      {activeUser && !isLoading && (
        <p className="text-xs text-[#8888AA] mb-4">
          Playlists creadas por{' '}
          <span className="font-mono text-[#7C6FFF] bg-[#7C6FFF]/10 px-2 py-0.5 rounded-full">
            {activeUser}
          </span>
          {' '}· {playlists.length} resultado{playlists.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid de playlists */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : playlists.length === 0 ? (
        <EmptyState
          message={activeUser ? `El usuario "${activeUser}" no tiene playlists` : 'No hay playlists aún'}
          icon="🎵"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.playlist_id as string}
              playlist={pl as unknown as Playlist}
              onClick={() => setSelected(pl as unknown as Playlist)}
              onDelete={(id) => deletePlaylist.mutate(id)}
            />
          ))}
        </div>
      )}

      <CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <PlaylistDetail playlist={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

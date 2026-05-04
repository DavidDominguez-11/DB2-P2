import { useQuery } from '@tanstack/react-query'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { type Playlist } from '../../types/api.types'
import { formatDate, formatDuration } from '../../utils/formatters'
import api from '../../api/client'
import { EP } from '../../api/endpoints'

interface Props {
  playlist: Playlist | null
  onClose: () => void
}

export default function PlaylistDetail({ playlist, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['playlist-songs', playlist?.playlist_id],
    queryFn: () =>
      api
        .get(`${EP.playlists}${playlist!.playlist_id}/songs`)
        .then((r) => r.data),
    enabled: !!playlist,
  })

  const songs: Record<string, unknown>[] = data?.songs ?? []

  return (
    <Modal
      open={!!playlist}
      onClose={onClose}
      title={playlist?.nombre ?? 'Playlist'}
      size="lg"
    >
      {playlist && (
        <div className="space-y-4">
          {/* Info de la playlist */}
          <div className="bg-[#090910] rounded-xl p-4 space-y-2">
            {playlist.descripcion && (
              <p className="text-sm text-[#8888AA]">{String(playlist.descripcion)}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-[#44445A]">
              <span>📅 {formatDate(playlist.fecha_creacion)}</span>
              {playlist.publica !== undefined && (
                <span>{playlist.publica ? '🌐 Pública' : '🔒 Privada'}</span>
              )}
              <span className="font-mono">ID: {playlist.playlist_id}</span>
            </div>
          </div>

          {/* Canciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#F0F0FF] font-display">
                Canciones
              </h4>
              {!isLoading && (
                <span className="text-xs text-[#44445A]">
                  {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
                </span>
              )}
            </div>

            {isLoading ? (
              <LoadingSpinner className="py-8" />
            ) : songs.length === 0 ? (
              <EmptyState
                message="Esta playlist no contiene canciones aún"
                icon="🎵"
              />
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {songs.map((song, i) => (
                  <div
                    key={song.song_id as string}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#252535]/30 transition-colors"
                  >
                    <span className="text-xs text-[#44445A] w-5 text-right shrink-0 font-mono">
                      {song.orden !== undefined && song.orden !== null ? String(song.orden) : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F0F0FF] truncate">
                        {String(song.titulo ?? song.song_id)}
                      </p>
                      <p className="text-xs text-[#44445A] font-mono">
                        ID: {song.song_id}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {song.duracion !== undefined && (
                        <p className="text-xs text-[#8888AA]">
                          {formatDuration(Number(song.duracion))}
                        </p>
                      )}
                      {song.popularidad !== undefined && (
                        <p className="text-xs text-[#44445A]">
                          ⭐ {song.popularidad}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

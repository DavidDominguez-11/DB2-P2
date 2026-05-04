import { type Playlist } from '../../types/api.types'
import { formatDate } from '../../utils/formatters'

interface Props {
  playlist: Playlist
  onClick?: () => void
  onDelete?: (id: string) => void
}

export default function PlaylistCard({ playlist, onClick, onDelete }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#16161F] border border-[#252535] rounded-xl p-5 transition-colors ${onClick ? 'cursor-pointer hover:border-[#7C6FFF]/40' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[#F0F0FF] font-display">{playlist.nombre}</h3>
          <p className="text-sm text-[#8888AA] mt-1 line-clamp-2">{playlist.descripcion}</p>
        </div>
        {playlist.publica !== undefined && (
          <span className="text-xs text-[#44445A]">{playlist.publica ? '🌐' : '🔒'}</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-[#44445A]">
        {playlist.numero_canciones !== undefined && (
          <span>🎵 {playlist.numero_canciones} canciones</span>
        )}
        <span>📅 {formatDate(playlist.fecha_creacion)}</span>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(playlist.playlist_id) }}
            className="ml-auto text-[#FF4455] hover:text-red-400 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

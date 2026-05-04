import { type Post } from '../../types/api.types'
import { formatDate } from '../../utils/formatters'

const TYPE_ICONS: Record<string, string> = {
  song: '🎵', playlist: '📋', update: '📣', event: '🎉',
}
const TYPE_COLORS: Record<string, string> = {
  song: 'text-[#7C6FFF]', playlist: 'text-[#00E5CC]', update: 'text-[#FFB347]', event: 'text-[#FF6B9D]',
}

interface EnrichedPost extends Post {
  likes?: number
  comentarios?: number
  autor?: string
  autor_id?: string
}

interface Props {
  post: EnrichedPost
  onDelete?: (id: string) => void
}

export default function PostCard({ post, onDelete }: Props) {
  const likes = Number(post.likes ?? 0)
  const comentarios = Number(post.comentarios ?? 0)

  return (
    <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5 hover:border-[#7C6FFF]/30 transition-colors">
      {/* Header: autor + tipo + fecha */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7C6FFF]/20 flex items-center justify-center text-sm font-bold text-[#7C6FFF] shrink-0">
            {post.autor ? post.autor.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-[#F0F0FF]">
              {post.autor ?? 'Autor desconocido'}
            </p>
            {post.autor_id && (
              <p className="text-xs text-[#44445A] font-mono">ID: {post.autor_id}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#44445A]">
          <span className={`font-medium ${TYPE_COLORS[post.tipo] ?? 'text-[#8888AA]'}`}>
            {TYPE_ICONS[post.tipo] ?? '📝'} {post.tipo}
          </span>
          {post.privacidad !== 'public' && (
            <span>🔒</span>
          )}
          <span>{post.fecha ? formatDate(String(post.fecha)) : '—'}</span>
        </div>
      </div>

      {/* Caption */}
      <p className="text-sm text-[#F0F0FF] leading-relaxed mb-3">{post.caption}</p>

      {/* Hashtags */}
      {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(post.hashtags as string[]).map((h) => (
            <span key={h} className="text-xs text-[#7C6FFF]">#{h}</span>
          ))}
        </div>
      )}

      {/* Footer: ID + stats + acciones */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#252535]/50">
        <span className="text-[10px] text-[#44445A] font-mono flex-1">
          ID: {post.post_id}
        </span>

        <div className="flex items-center gap-3 text-xs text-[#8888AA]">
          <span title="Likes" className="flex items-center gap-1">
            <span>❤️</span>
            <span className="font-medium text-[#F0F0FF]">{likes}</span>
          </span>
          <span title="Comentarios" className="flex items-center gap-1">
            <span>💬</span>
            <span className="font-medium text-[#F0F0FF]">{comentarios}</span>
          </span>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(post.post_id)}
            className="text-xs text-[#FF4455] hover:text-red-400 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

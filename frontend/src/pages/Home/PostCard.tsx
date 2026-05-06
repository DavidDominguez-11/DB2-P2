import { useState } from 'react'
import { toast } from 'sonner'
import { type Post } from '../../types/api.types'
import { formatDate } from '../../utils/formatters'
import { interactionsApi } from '../../api/interactions.api'
import { useQueryClient } from '@tanstack/react-query'

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
  myUserId?: string
  onDelete?: (id: string) => void
  onViewComments?: (post: EnrichedPost) => void
}

export default function PostCard({ post, myUserId, onDelete, onViewComments }: Props) {
  const likes = Number(post.likes ?? 0)
  const comentarios = Number(post.comentarios ?? 0)
  const [liking, setLiking] = useState(false)
  const qc = useQueryClient()

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!myUserId) {
      toast.error('Establece tu User ID primero (campo arriba en el feed)')
      return
    }
    setLiking(true)
    try {
      await interactionsApi.create({
        from_label: 'User',
        from_id: String(myUserId),
        to_label: 'Post',
        to_id: String(post.post_id),
        rel_type: 'LIKED',
        properties: {
          fecha: new Date().toISOString().split('T')[0],
          plataforma: 'web',
          contexto: 'feed',
        },
      })
      toast.success('❤️ Like registrado')
      qc.invalidateQueries({ queryKey: ['feed'] })
    } catch {
      // error ya manejado por el interceptor
    } finally {
      setLiking(false)
    }
  }

  return (
    <div
      className="bg-[#16161F] border border-[#252535] rounded-xl p-5 hover:border-[#7C6FFF]/30 transition-colors cursor-pointer"
      onClick={() => onViewComments?.(post)}
    >
      {/* Header */}
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
          {post.privacidad !== 'public' && <span>🔒</span>}
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

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#252535]/50">
        <span className="text-[10px] text-[#44445A] font-mono flex-1">
          ID: {post.post_id}
        </span>

        <div className="flex items-center gap-3 text-xs">
          {/* Botón Like */}
          <button
            onClick={handleLike}
            disabled={liking}
            title={myUserId ? `Dar like como usuario ${myUserId}` : 'Establece tu User ID para dar like'}
            className={`flex items-center gap-1 transition-all disabled:opacity-50 ${
              myUserId
                ? 'text-[#8888AA] hover:text-[#FF6B9D] hover:scale-110'
                : 'text-[#44445A] cursor-not-allowed'
            }`}
          >
            <span>{liking ? '⏳' : '❤️'}</span>
            <span className="font-medium text-[#F0F0FF]">{likes}</span>
          </button>

          {/* Botón Comentarios */}
          <button
            onClick={(e) => { e.stopPropagation(); onViewComments?.(post) }}
            className="flex items-center gap-1 text-[#8888AA] hover:text-[#F0F0FF] transition-colors"
            title="Ver comentarios"
          >
            <span>💬</span>
            <span className="font-medium text-[#F0F0FF]">{comentarios}</span>
          </button>
        </div>

        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(post.post_id) }}
            className="text-xs text-[#FF4455] hover:text-red-400 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

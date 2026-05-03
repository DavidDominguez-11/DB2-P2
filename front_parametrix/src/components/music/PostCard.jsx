import { Heart, MessageCircle, Share2, Music2, Play } from 'lucide-react'
import { useState } from 'react'
import { timeAgo, formatDuration } from '../../utils/neo4jParser'
import { updatePost } from '../../api'
import { useApp } from '../../store/AppContext'

export default function PostCard({ post, onLike }) {
  const [liked,     setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes ?? post.total_likes ?? 0)
  const { addToast } = useApp()

  // Post may embed song/artist directly or via nested objects depending on backend
  const song   = post.song ?? (post.song_id ? { song_id: post.song_id, titulo: post.song_titulo, duracion: post.duracion } : null)
  const author = post.author ?? post.user ?? { username: post.user_id ?? 'usuario', user_id: post.user_id }

  const handleLike = async () => {
    const next = !liked
    setLiked(next)
    setLikeCount(c => next ? c + 1 : c - 1)
    onLike?.(post.post_id)
  }

  const fecha = post.fecha ?? post.created_at ?? post.date ?? ''

  return (
    <article className="bg-panel border border-border rounded-2xl p-5 card-hover animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {String(author.username ?? author.user_id ?? '?')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary font-body">@{author.username ?? author.user_id}</p>
          {fecha && <p className="text-xs text-text-muted font-body">{timeAgo(fecha)}</p>}
        </div>
        <div className="ml-auto">
          {post.tipo && (
            <span className="text-xs font-mono text-text-muted bg-muted px-2 py-0.5 rounded-md">{post.tipo}</span>
          )}
        </div>
      </div>

      {/* Caption */}
      <p className="text-sm text-text-primary leading-relaxed mb-3 font-body">{post.caption}</p>

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.hashtags.map(h => (
            <span key={h} className="text-xs text-accent font-mono">#{h}</span>
          ))}
        </div>
      )}

      {/* Song embed (if post includes song data) */}
      {song?.titulo && (
        <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center gap-3 mb-4 group cursor-pointer hover:border-accent/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/40 to-neon/20 flex items-center justify-center flex-shrink-0">
            <Play size={14} className="text-white ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate font-body">{song.titulo}</p>
            <p className="text-xs text-text-muted font-body">
              {song.artist_nombre ?? song.artist_id ?? ''}
              {song.duracion ? ` · ${formatDuration(song.duracion)}` : ''}
            </p>
          </div>
          <Music2 size={14} className="text-text-muted flex-shrink-0" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-rose' : 'text-text-muted hover:text-rose'}`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          <span className="font-mono">{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-sky transition-colors">
          <MessageCircle size={14} />
          <span className="font-mono">{post.comments ?? post.total_comments ?? 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-neon transition-colors ml-auto">
          <Share2 size={14} />
        </button>
      </div>
    </article>
  )
}

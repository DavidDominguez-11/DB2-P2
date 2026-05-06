import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { formatDate } from '../../utils/formatters'
import api from '../../api/client'
import { EP } from '../../api/endpoints'
import { interactionsApi } from '../../api/interactions.api'

interface Comment {
  rel_id: string
  contenido: string | null
  fecha: string | null
  likes: number | null
  autor: string | null
  autor_id: string | number | null
}

interface Props {
  postId: string | null
  postCaption?: string
  myUserId?: string
  onClose: () => void
}

export default function PostComments({ postId, postCaption, myUserId, onClose }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => api.get(`${EP.posts}${postId}/comments`).then((r) => r.data),
    enabled: !!postId,
  })

  const deleteComment = useMutation({
    mutationFn: (relId: string) => interactionsApi.delete(relId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-comments', postId] })
      qc.invalidateQueries({ queryKey: ['feed'] })
      toast.success('Comentario eliminado')
      setDeleteTarget(null)
    },
  })

  const addComment = useMutation({
    mutationFn: () =>
      interactionsApi.create({
        from_label: 'User',
        from_id: String(myUserId),
        to_label: 'Post',
        to_id: String(postId),
        rel_type: 'COMMENTED',
        properties: {
          contenido: commentText.trim(),
          fecha: new Date().toISOString().split('T')[0],
          plataforma: 'web',
          likes: 0,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-comments', postId] })
      qc.invalidateQueries({ queryKey: ['feed'] })
      toast.success('💬 Comentario publicado')
      setCommentText('')
    },
  })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!myUserId) {
      toast.error('Establece tu User ID primero (campo arriba en el feed)')
      return
    }
    if (!commentText.trim()) return
    addComment.mutate()
  }

  const comments: Comment[] = data?.comments ?? []

  return (
    <>
      <Modal open={!!postId} onClose={onClose} title="Comentarios" size="md">
        {/* Preview del post */}
        {postCaption && (
          <div className="bg-[#090910] rounded-lg px-4 py-3 mb-4 border border-[#252535]">
            <p className="text-xs text-[#44445A] mb-1">Post</p>
            <p className="text-sm text-[#F0F0FF] line-clamp-2">{postCaption}</p>
          </div>
        )}

        {/* Lista de comentarios */}
        {isLoading ? (
          <LoadingSpinner className="py-8" />
        ) : comments.length === 0 ? (
          <EmptyState message="Este post no tiene comentarios aún" icon="💬" />
        ) : (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-[#44445A] mb-3">
              {comments.length} comentario{comments.length !== 1 ? 's' : ''}
            </p>
            {comments.map((c) => (
              <div
                key={c.rel_id}
                className="bg-[#090910] border border-[#252535] rounded-xl p-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#7C6FFF]/20 flex items-center justify-center text-xs font-bold text-[#7C6FFF] shrink-0">
                      {c.autor ? c.autor.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#F0F0FF]">
                        {c.autor ?? 'Usuario desconocido'}
                      </p>
                      {c.fecha && (
                        <p className="text-[10px] text-[#44445A]">{formatDate(String(c.fecha))}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(c.rel_id)}
                    className="text-[#FF4455] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs shrink-0"
                  >
                    🗑️
                  </button>
                </div>

                {c.contenido && (
                  <p className="text-sm text-[#F0F0FF] leading-relaxed ml-9">{c.contenido}</p>
                )}

                {c.likes !== null && c.likes !== undefined && (
                  <p className="text-[10px] text-[#44445A] ml-9 mt-1">❤️ {c.likes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario de nuevo comentario */}
        <div className="border-t border-[#252535] pt-4">
          {myUserId ? (
            <form onSubmit={handleSubmitComment} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#7C6FFF]/20 flex items-center justify-center text-xs font-bold text-[#7C6FFF]">
                  {myUserId.toString().charAt(0)}
                </div>
                <span className="text-xs text-[#8888AA]">
                  Comentando como <span className="text-[#7C6FFF] font-mono">{myUserId}</span>
                </span>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={2}
                className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] resize-none transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {addComment.isPending ? 'Publicando...' : '💬 Comentar'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-[#44445A] text-center py-2">
              Establece tu <span className="text-[#7C6FFF]">User ID</span> en el feed para comentar
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteComment.mutate(deleteTarget)}
        title="Eliminar comentario"
        message="¿Eliminar esta relación COMMENTED? La acción no se puede deshacer."
        danger
        loading={deleteComment.isPending}
      />
    </>
  )
}

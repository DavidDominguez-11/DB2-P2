import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import PostComments from './PostComments'
import { postsApi } from '../../api/posts.api'

type Tab = 'all' | 'follows'
interface PostLike { post_id: string; caption?: string }

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const [selectedPost, setSelectedPost] = useState<PostLike | null>(null)
  const qc = useQueryClient()

  // User ID activo: sirve para likes Y para el tab Siguiendo
  const [myUserId, setMyUserId] = useState(() => localStorage.getItem('my_user_id') ?? '')
  const [myUserInput, setMyUserInput] = useState(() => localStorage.getItem('my_user_id') ?? '')

  const saveMyUser = (e: React.FormEvent) => {
    e.preventDefault()
    const val = myUserInput.trim()
    setMyUserId(val)
    localStorage.setItem('my_user_id', val)
    toast.success(val ? `Sesión como usuario ${val}` : 'Sesión cerrada')
  }

  // Tab "Todos" — filtro por user_id opcional
  const [userInput, setUserInput] = useState('')
  const [activeUser, setActiveUser] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 15

  const allFeed = useQuery({
    queryKey: ['feed-all', activeUser, skip],
    queryFn: () => postsApi.feed({ skip, limit, ...(activeUser ? { user_id: activeUser } : {}) }),
    enabled: tab === 'all',
  })

  // Tab "Siguiendo" — usa myUserId directamente
  const followsFeed = useQuery({
    queryKey: ['feed-follows', myUserId],
    queryFn: () => postsApi.followsFeed(myUserId),
    enabled: tab === 'follows' && !!myUserId,
  })

  const deletePost = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed-all'] })
      qc.invalidateQueries({ queryKey: ['feed-follows'] })
      toast.success('Post eliminado')
    },
  })

  const isLoading = tab === 'all' ? allFeed.isLoading : followsFeed.isLoading
  const posts: Record<string, unknown>[] =
    tab === 'all' ? (allFeed.data?.posts ?? []) : (followsFeed.data?.posts ?? [])

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveUser(userInput.trim())
    setSkip(0)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Feed"
        subtitle="Publicaciones de la red musical"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors font-medium"
          >
            + Nuevo Post
          </button>
        }
      />

      {/* Mi usuario activo — controla likes y tab Siguiendo */}
      <form
        onSubmit={saveMyUser}
        className="flex gap-2 mb-4 bg-[#111118] border border-[#252535] rounded-xl p-3 items-center"
      >
        <span className="text-xs text-[#8888AA] shrink-0">👤 Mi User ID:</span>
        <input
          value={myUserInput}
          onChange={(e) => setMyUserInput(e.target.value)}
          placeholder="Tu ID — para likes y ver Siguiendo..."
          className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-1.5 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] transition-colors"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-[#7C6FFF] hover:bg-violet-500 text-white text-xs rounded-lg transition-colors shrink-0"
        >
          {myUserId ? 'Cambiar' : 'Entrar'}
        </button>
        {myUserId && (
          <span className="text-xs text-[#22D3A0] font-mono shrink-0">✓ {myUserId}</span>
        )}
      </form>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#111118] border border-[#252535] rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'all' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}
        >
          🌐 Todos
        </button>
        <button
          onClick={() => setTab('follows')}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'follows' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}
        >
          👥 Siguiendo
        </button>
      </div>

      {/* Buscador solo en tab Todos */}
      {tab === 'all' && (
        <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] text-sm">🔍</span>
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Filtrar por User ID (vacío = todos)..."
              className="w-full bg-[#16161F] border border-[#252535] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Buscar
          </button>
          {activeUser && (
            <button
              type="button"
              onClick={() => { setUserInput(''); setActiveUser(''); setSkip(0) }}
              className="px-3 py-2 border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </form>
      )}

      {/* Badges de contexto */}
      {tab === 'all' && activeUser && (
        <p className="text-xs text-[#8888AA] mb-3">
          Posts de{' '}
          <span className="font-mono text-[#7C6FFF] bg-[#7C6FFF]/10 px-2 py-0.5 rounded-full">{activeUser}</span>
          {' '}· {posts.length} resultado{posts.length !== 1 ? 's' : ''}
        </p>
      )}
      {tab === 'follows' && myUserId && !isLoading && (
        <p className="text-xs text-[#8888AA] mb-3">
          Posts de usuarios seguidos por{' '}
          <span className="font-mono text-[#7C6FFF] bg-[#7C6FFF]/10 px-2 py-0.5 rounded-full">{myUserId}</span>
          {' '}· {posts.length} resultado{posts.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Lista de posts */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : tab === 'follows' && !myUserId ? (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-8 text-center text-[#8888AA] text-sm">
          Ingresa tu User ID en el campo de arriba para ver los posts de las personas que sigues
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          message={
            tab === 'follows'
              ? `El usuario "${myUserId}" no sigue a nadie con posts`
              : activeUser
                ? `No hay posts del usuario "${activeUser}"`
                : 'No hay posts todavía'
          }
          icon="📭"
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.post_id as string}
              post={post as unknown as import('../../types/api.types').Post}
              myUserId={myUserId || undefined}
              onDelete={(id) => deletePost.mutate(id)}
              onViewComments={(p) => setSelectedPost({ post_id: String(p.post_id), caption: String(p.caption ?? '') })}
            />
          ))}
        </div>
      )}

      {/* Paginación solo en tab Todos */}
      {tab === 'all' && (
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - limit))}
            className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs text-[#44445A]">
            {posts.length > 0 ? `${skip + 1}–${skip + posts.length}` : '—'}
          </span>
          <button
            disabled={posts.length < limit}
            onClick={() => setSkip(skip + limit)}
            className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <PostComments
        postId={selectedPost?.post_id ?? null}
        postCaption={selectedPost?.caption}
        myUserId={myUserId || undefined}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  )
}

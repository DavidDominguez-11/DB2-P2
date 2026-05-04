import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import { postsApi } from '../../api/posts.api'

type Tab = 'all' | 'follows'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const qc = useQueryClient()

  // Tab "Todos" — filtro por user_id opcional
  const [userInput, setUserInput] = useState('')
  const [activeUser, setActiveUser] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 15

  // Tab "Siguiendo" — posts de follows de un user_id
  const [followsInput, setFollowsInput] = useState('')
  const [activeFollows, setActiveFollows] = useState('')

  const allFeed = useQuery({
    queryKey: ['feed-all', activeUser, skip],
    queryFn: () => postsApi.feed({ skip, limit, ...(activeUser ? { user_id: activeUser } : {}) }),
    enabled: tab === 'all',
  })

  const followsFeed = useQuery({
    queryKey: ['feed-follows', activeFollows],
    queryFn: () => postsApi.followsFeed(activeFollows),
    enabled: tab === 'follows' && !!activeFollows,
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
    tab === 'all'
      ? (allFeed.data?.posts ?? [])
      : (followsFeed.data?.posts ?? [])

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveUser(userInput.trim())
    setSkip(0)
  }

  const handleFollowsSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFollows(followsInput.trim())
  }

  const inputCls = 'flex-1 bg-[#16161F] border border-[#252535] rounded-lg px-4 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] transition-colors'

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

      {/* Buscador según tab activo */}
      {tab === 'all' && (
        <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] text-sm">👤</span>
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

      {tab === 'follows' && (
        <form onSubmit={handleFollowsSearch} className="flex gap-2 mb-4">
          <input
            value={followsInput}
            onChange={(e) => setFollowsInput(e.target.value)}
            placeholder="User ID — ver posts de usuarios que sigue..."
            className={inputCls}
          />
          <button type="submit" className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Buscar
          </button>
          {activeFollows && (
            <button
              type="button"
              onClick={() => { setFollowsInput(''); setActiveFollows('') }}
              className="px-3 py-2 border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </form>
      )}

      {/* Badge de contexto activo */}
      {tab === 'all' && activeUser && (
        <p className="text-xs text-[#8888AA] mb-3">
          Posts de{' '}
          <span className="font-mono text-[#7C6FFF] bg-[#7C6FFF]/10 px-2 py-0.5 rounded-full">{activeUser}</span>
          {' '}· {posts.length} resultado{posts.length !== 1 ? 's' : ''}
        </p>
      )}
      {tab === 'follows' && activeFollows && (
        <p className="text-xs text-[#8888AA] mb-3">
          Posts de usuarios seguidos por{' '}
          <span className="font-mono text-[#7C6FFF] bg-[#7C6FFF]/10 px-2 py-0.5 rounded-full">{activeFollows}</span>
          {' '}· {posts.length} resultado{posts.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Lista de posts */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : tab === 'follows' && !activeFollows ? (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-8 text-center text-[#8888AA] text-sm">
          Ingresa un User ID para ver los posts de las personas que sigue
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          message={
            tab === 'follows'
              ? `El usuario "${activeFollows}" no sigue a nadie con posts`
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
              onDelete={(id) => deletePost.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Paginación solo en tab "Todos" */}
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
    </div>
  )
}

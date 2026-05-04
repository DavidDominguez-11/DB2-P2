import { useState } from 'react'
import { useUser } from '../../../hooks/useUsers'
import { useSong } from '../../../hooks/useSongs'
import { usePlaylist } from '../../../hooks/usePlaylists'
import { usePost } from '../../../hooks/usePosts'
import { useGenre } from '../../../hooks/useGenres'
import NodeCard from '../../../components/graph/NodeCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

type EntityType = 'users' | 'songs' | 'playlists' | 'posts' | 'genres'

export default function SingleNodePanel() {
  const [entity, setEntity] = useState<EntityType>('users')
  const [id, setId] = useState('')
  const [activeId, setActiveId] = useState('')

  const userQ = useUser(entity === 'users' ? activeId : '')
  const songQ = useSong(entity === 'songs' ? activeId : '')
  const plQ = usePlaylist(entity === 'playlists' ? activeId : '')
  const postQ = usePost(entity === 'posts' ? activeId : '')
  const genreQ = useGenre(entity === 'genres' ? activeId : '')

  const q = { users: userQ, songs: songQ, playlists: plQ, posts: postQ, genres: genreQ }[entity]

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Consultar Nodo Individual</h3>
        <div className="flex gap-2 mb-3">
          {(['users','songs','playlists','posts','genres'] as EntityType[]).map((e) => (
            <button key={e} onClick={() => { setEntity(e); setActiveId('') }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}>
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder={`ID del ${entity.slice(0,-1)}`}
            className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
          <button onClick={() => setActiveId(id)} className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Consultar
          </button>
        </div>
      </div>

      {q.isLoading && <LoadingSpinner className="py-8" />}
      {q.data && !q.isLoading && <NodeCard node={q.data} />}
      {q.isError && activeId && (
        <div className="bg-[#16161F] border border-[#FF4455]/30 rounded-xl p-5 text-center text-[#FF4455] text-sm">
          Nodo no encontrado
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useSimilarUsers } from '../../hooks/useAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function SimilarUsersPanel() {
  const [userId, setUserId] = useState('')
  const [activeId, setActiveId] = useState('')
  const { data, isLoading } = useSimilarUsers(activeId, 10)

  const similar: Record<string, unknown>[] = data?.similar_users ?? []

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-3 font-display">Usuarios Similares (Jaccard)</h3>
        <p className="text-xs text-[#8888AA] mb-4">Usuarios con patrones de escucha similares</p>
        <div className="flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID de usuario"
            className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
          />
          <button onClick={() => setActiveId(userId)} className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-8" />
      ) : similar.length > 0 ? (
        <div className="space-y-3">
          {similar.map((u, i) => (
            <div key={i} className="bg-[#16161F] border border-[#252535] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00E5CC]/20 flex items-center justify-center text-[#00E5CC] font-bold text-sm">{i + 1}</div>
                <div>
                  <p className="font-medium text-[#F0F0FF]">{String(u.username ?? u.user_id ?? '')}</p>
                  {u.similarity !== undefined && <p className="text-xs text-[#8888AA]">Similitud: {Number(u.similarity).toFixed(3)}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeId ? (
        <EmptyState message="Sin usuarios similares encontrados" icon="👥" />
      ) : null}
    </div>
  )
}

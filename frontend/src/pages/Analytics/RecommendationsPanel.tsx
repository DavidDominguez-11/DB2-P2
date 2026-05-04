import { useState } from 'react'
import { useRecommendations } from '../../hooks/useAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function RecommendationsPanel() {
  const [userId, setUserId] = useState('')
  const [activeId, setActiveId] = useState('')
  const { data, isLoading } = useRecommendations(activeId, 10)

  const recs: Record<string, unknown>[] = data?.recommendations ?? []

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-3 font-display">Recomendaciones por Jaccard</h3>
        <p className="text-xs text-[#8888AA] mb-4">Canciones recomendadas basadas en similitud de escuchas</p>
        <div className="flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID de usuario"
            className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
          />
          <button
            onClick={() => setActiveId(userId)}
            className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-8" />
      ) : recs.length > 0 ? (
        <div className="grid gap-3">
          {recs.map((r, i) => (
            <div key={i} className="bg-[#16161F] border border-[#252535] rounded-xl p-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-[#7C6FFF] font-mono w-8 text-center">{i + 1}</span>
              <div>
                <p className="font-medium text-[#F0F0FF]">{String(r.titulo ?? r.song_id ?? r.name ?? JSON.stringify(r))}</p>
                {r.score !== undefined && <p className="text-xs text-[#8888AA]">Score Jaccard: {Number(r.score).toFixed(3)}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : activeId ? (
        <EmptyState message="Sin recomendaciones para este usuario" icon="🎯" />
      ) : null}
    </div>
  )
}

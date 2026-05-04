import { useInfluenceRanking } from '../../hooks/useAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function InfluenceRanking() {
  const { data, isLoading } = useInfluenceRanking(10)
  const ranking: Record<string, unknown>[] = data?.ranking ?? []

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">Ranking de Influencia</h3>
        <p className="text-xs text-[#8888AA]">Ponderado: seguidores (50%) + likes (30%) + comentarios (20%)</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-8" />
      ) : ranking.length > 0 ? (
        <div className="space-y-2">
          {ranking.map((u, i) => (
            <div key={i} className="bg-[#16161F] border border-[#252535] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
                <div>
                  <p className="font-medium text-[#F0F0FF]">{String(u.username ?? u.user_id ?? '')}</p>
                  <p className="text-xs text-[#8888AA]">
                    {u.followers !== undefined && `Seguidores: ${u.followers}`}
                    {u.likes !== undefined && ` · Likes: ${u.likes}`}
                  </p>
                </div>
              </div>
              {u.score !== undefined && (
                <span className="text-[#7C6FFF] font-bold font-mono">{Number(u.score).toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No hay datos de influencia" icon="⭐" />
      )}
    </div>
  )
}

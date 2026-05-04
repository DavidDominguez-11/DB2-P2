import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import OverviewPanel from './OverviewPanel'
import RecommendationsPanel from './RecommendationsPanel'
import SimilarUsersPanel from './SimilarUsersPanel'
import InfluenceRanking from './InfluenceRanking'
import GenreDistribution from './GenreDistribution'

const PANELS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'recommendations', label: '🎯 Recomendaciones' },
  { id: 'similar-users', label: '👥 Usuarios Similares' },
  { id: 'influence', label: '⭐ Influencia' },
  { id: 'genres', label: '🎸 Géneros' },
] as const

type Panel = (typeof PANELS)[number]['id']

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams()
  const panel = (searchParams.get('panel') as Panel) ?? 'overview'

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Insights y métricas de la red musical" />

      <div className="flex gap-1 mb-6 flex-wrap">
        {PANELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSearchParams({ panel: id })}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              panel === id
                ? 'bg-[#7C6FFF] text-white'
                : 'bg-[#16161F] border border-[#252535] text-[#8888AA] hover:text-[#F0F0FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === 'overview' && <OverviewPanel />}
      {panel === 'recommendations' && <RecommendationsPanel />}
      {panel === 'similar-users' && <SimilarUsersPanel />}
      {panel === 'influence' && <InfluenceRanking />}
      {panel === 'genres' && <GenreDistribution />}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { usePopularSongs } from '../../hooks/useAnalytics'
import { cypherApi } from '../../api/cypher.api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Query Cypher para obtener conteos exactos de cada entidad
const COUNTS_QUERY = `
MATCH (u:User)     WITH count(u) AS usuarios
MATCH (s:Song)     WITH usuarios, count(s) AS canciones
MATCH (g:Genre)    WITH usuarios, canciones, count(g) AS generos
MATCH (p:Playlist) WITH usuarios, canciones, generos, count(p) AS playlists
RETURN usuarios, canciones, generos, playlists
`

export default function OverviewPanel() {
  const countsQ = useQuery({
    queryKey: ['overview-counts'],
    queryFn: () => cypherApi.query(COUNTS_QUERY),
  })

  const popularSongs = usePopularSongs(8)

  const counts = countsQ.data?.results?.[0] as Record<string, number> | undefined

  // Campo correcto según gds_service.py → total_listeners
  const chartData = (popularSongs.data?.popular_songs ?? []).slice(0, 8).map(
    (s: Record<string, unknown>) => ({
      name: String(s.titulo ?? s.song_id ?? '').slice(0, 14),
      oyentes: Number(s.total_listeners ?? 0),
    })
  )

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      {countsQ.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#16161F] border border-[#252535] rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Usuarios"  value={counts?.usuarios  ?? '—'} icon="👤" color="#7C6FFF" />
          <StatCard title="Canciones" value={counts?.canciones ?? '—'} icon="🎵" color="#00E5CC" />
          <StatCard title="Géneros"   value={counts?.generos   ?? '—'} icon="🎸" color="#22D3A0" />
          <StatCard title="Playlists" value={counts?.playlists ?? '—'} icon="📋" color="#FFB347" />
        </div>
      )}

      {/* Bar Chart canciones más escuchadas */}
      {popularSongs.isLoading ? (
        <LoadingSpinner className="py-8" />
      ) : chartData.length > 0 ? (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#F0F0FF] font-display">
              Canciones más escuchadas
            </h3>
            <span className="text-xs text-[#44445A]">top {chartData.length}</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252535" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8888AA', fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#16161F', border: '1px solid #252535', borderRadius: 8 }}
                formatter={(v: number) => [`${v} oyentes únicos`, 'Oyentes']}
              />
              <Bar dataKey="oyentes" fill="#7C6FFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-8 text-center text-[#44445A] text-sm">
          Sin datos de escuchas — crea relaciones <code className="text-[#7C6FFF] bg-[#7C6FFF]/10 px-1 rounded">LISTENED</code> entre usuarios y canciones
        </div>
      )}
    </div>
  )
}

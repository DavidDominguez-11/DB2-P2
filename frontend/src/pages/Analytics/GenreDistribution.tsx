import { useGenreDistribution } from '../../hooks/useAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#7C6FFF', '#00E5CC', '#FF4455', '#22D3A0', '#FFB347', '#87CEEB', '#DDA0DD', '#98FB98']

export default function GenreDistribution() {
  const { data, isLoading } = useGenreDistribution()
  const genres: Record<string, unknown>[] = data?.genre_distribution ?? []

  const chartData = genres.slice(0, 8).map((g) => ({
    name: String(g.nombre ?? g.genre ?? ''),
    value: Number(g.total_songs ?? g.song_count ?? g.count ?? 1),
  }))

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">Distribución por Género</h3>
        <p className="text-xs text-[#8888AA]">Canciones y escuchas agrupadas por género musical</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-8" />
      ) : chartData.length > 0 ? (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#16161F', border: '1px solid #252535', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-8 text-center text-[#8888AA]">
          Sin datos de distribución
        </div>
      )}

      {genres.length > 0 && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#252535] bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs text-[#8888AA] uppercase">Género</th>
                <th className="px-4 py-3 text-right text-xs text-[#8888AA] uppercase">Canciones</th>
                <th className="px-4 py-3 text-right text-xs text-[#8888AA] uppercase">Escuchas</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((g, i) => (
                <tr key={i} className={`border-b border-[#252535]/50 ${i % 2 === 0 ? 'bg-[#16161F]' : 'bg-[#111118]'}`}>
                  <td className="px-4 py-3 text-[#F0F0FF]">{String(g.nombre ?? g.genre ?? '')}</td>
                  <td className="px-4 py-3 text-right text-[#8888AA]">{String(g.total_songs ?? g.song_count ?? '-')}</td>
                  <td className="px-4 py-3 text-right text-[#7C6FFF]">{String(g.total_listens ?? g.listen_count ?? '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useUsersAggregate } from '../../../hooks/useUsers'
import { useSongsAggregate } from '../../../hooks/useSongs'
import { useGenresAggregate } from '../../../hooks/useGenres'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import JsonViewer from '../../../components/common/JsonViewer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type EntityType = 'users' | 'songs' | 'genres'

export default function AggregationPanel() {
  const [entity, setEntity] = useState<EntityType>('users')
  const [groupBy, setGroupBy] = useState('premium')
  const [aggField, setAggField] = useState('user_id')
  const [aggFunc, setAggFunc] = useState('count')
  const [submitted, setSubmitted] = useState(false)

  const usersAgg = useUsersAggregate({ group_by: groupBy, agg_field: aggField, agg_func: aggFunc }, submitted && entity === 'users')
  const songsAgg = useSongsAggregate({ group_by: groupBy, agg_field: aggField, agg_func: aggFunc }, submitted && entity === 'songs')
  const genresAgg = useGenresAggregate({ group_by: groupBy, agg_field: aggField, agg_func: aggFunc }, submitted && entity === 'genres')

  const q = { users: usersAgg, songs: songsAgg, genres: genresAgg }[entity]
  const agg: Record<string, unknown>[] = q.data?.aggregation ?? []

  const chartData = agg.slice(0, 12).map((r) => ({
    name: String(r.group_value ?? '').slice(0, 15),
    value: Number(r.agg_result ?? 0),
  }))

  const DEFAULT_FIELDS: Record<EntityType, { group: string; field: string }> = {
    users: { group: 'premium', field: 'user_id' },
    songs: { group: 'popularidad', field: 'song_id' },
    genres: { group: 'nombre', field: 'popularidad' },
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Agregar Nodos</h3>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(['users','songs','genres'] as EntityType[]).map((e) => (
              <button key={e} onClick={() => { setEntity(e); setGroupBy(DEFAULT_FIELDS[e].group); setAggField(DEFAULT_FIELDS[e].field); setSubmitted(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">group_by</label>
              <input value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]" />
            </div>
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">agg_field</label>
              <input value={aggField} onChange={(e) => setAggField(e.target.value)} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]" />
            </div>
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">agg_func</label>
              <select value={aggFunc} onChange={(e) => setAggFunc(e.target.value)} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]">
                <option>count</option><option>avg</option><option>sum</option><option>min</option><option>max</option>
              </select>
            </div>
          </div>
          <button onClick={() => setSubmitted(true)} className="px-6 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Ejecutar Agregación
          </button>
        </div>
      </div>

      {q.isLoading && submitted && <LoadingSpinner className="py-8" />}

      {chartData.length > 0 && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252535" />
              <XAxis dataKey="name" tick={{ fill: '#8888AA', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#16161F', border: '1px solid #252535', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#00E5CC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {agg.length > 0 && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#252535] flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#F0F0FF]">
              Resultados — {agg.length} grupo{agg.length !== 1 ? 's' : ''}
            </h4>
            <span className="text-xs text-[#44445A] font-mono">{aggFunc}({aggField}) GROUP BY {groupBy}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#111118]">
                <th className="px-5 py-2.5 text-left text-xs text-[#8888AA] uppercase tracking-wider">
                  {groupBy}
                </th>
                <th className="px-5 py-2.5 text-right text-xs text-[#8888AA] uppercase tracking-wider">
                  {aggFunc}({aggField})
                </th>
              </tr>
            </thead>
            <tbody>
              {agg.map((r, i) => (
                <tr key={i} className={`border-t border-[#252535]/50 ${i % 2 === 0 ? 'bg-[#16161F]' : 'bg-[#111118]'}`}>
                  <td className="px-5 py-2.5 text-[#F0F0FF] font-mono">
                    {String(r.group_value ?? '-')}
                  </td>
                  <td className="px-5 py-2.5 text-right text-[#00E5CC] font-mono font-medium">
                    {Number(r.agg_result ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

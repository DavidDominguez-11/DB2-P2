import { useState } from 'react'
import { useCypherQuery } from '../../../hooks/useCypher'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const QUERIES = [
  {
    id: 1,
    title: 'Usuarios más activos',
    description: 'Lista los 10 usuarios que más canciones han escuchado, ordenados por cantidad de escuchas.',
    icon: '🎧',
    color: '#7C6FFF',
    query: `MATCH (u:User)-[r:LISTENED]->()
RETURN u.username AS usuario, count(r) AS escuchas
ORDER BY escuchas DESC LIMIT 10`,
  },
  {
    id: 2,
    title: 'Canciones más populares',
    description: 'Las 10 canciones con más oyentes únicos en la plataforma.',
    icon: '🎵',
    color: '#00E5CC',
    query: `MATCH (s:Song)<-[:LISTENED]-(u:User)
RETURN s.titulo AS cancion, count(u) AS oyentes
ORDER BY oyentes DESC LIMIT 10`,
  },
  {
    id: 3,
    title: 'Ranking de influencia',
    description: 'Top 10 usuarios con más seguidores, que representan los perfiles más influyentes de la red.',
    icon: '⭐',
    color: '#FFB347',
    query: `MATCH (u:User)<-[:FOLLOWS]-(f:User)
RETURN u.username AS usuario, count(f) AS seguidores
ORDER BY seguidores DESC LIMIT 10`,
  },
  {
    id: 4,
    title: 'Usuarios que se siguen mutuamente',
    description: 'Pares de usuarios con relación de seguimiento mutuo (ambos se siguen entre sí).',
    icon: '🤝',
    color: '#22D3A0',
    query: `MATCH (u1:User)-[:FOLLOWS]->(u2:User)-[:FOLLOWS]->(u1)
RETURN u1.username AS usuario1, u2.username AS usuario2
LIMIT 20`,
  },
  {
    id: 5,
    title: 'Usuarios con sus canciones escuchadas',
    description: 'Muestra qué canciones ha escuchado cada usuario, con la fecha de escucha.',
    icon: '📋',
    color: '#FF6B9D',
    query: `MATCH (u:User)-[r:LISTENED]->(s:Song)
RETURN u.username AS usuario, s.titulo AS cancion, r.fecha AS fecha
ORDER BY u.username LIMIT 25`,
  },
  {
    id: 6,
    title: 'Nodos aislados',
    description: 'Nodos que no tienen ninguna relación con otros nodos en el grafo (sin conexiones).',
    icon: '🔍',
    color: '#FF4455',
    query: `MATCH (n)
WHERE NOT (n)--()
RETURN labels(n) AS tipo, properties(n) AS propiedades
LIMIT 20`,
  },
]

export default function CypherConsole() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [activeTitle, setActiveTitle] = useState('')
  const runQuery = useCypherQuery()

  const execute = (q: typeof QUERIES[0]) => {
    setActiveId(q.id)
    setActiveTitle(q.title)
    setResults([])
    setColumns([])
    runQuery.mutate(q.query, {
      onSuccess: (data) => {
        const rows: Record<string, unknown>[] =
          data?.results ?? data?.data ?? (Array.isArray(data) ? data : [])
        if (rows.length > 0) {
          setColumns(Object.keys(rows[0]))
          setResults(rows.slice(0, 100))
        } else {
          setColumns([])
          setResults([])
        }
      },
    })
  }

  const activeQuery = QUERIES.find((q) => q.id === activeId)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">Consultas Cypher</h3>
        <p className="text-xs text-[#8888AA]">
          Selecciona una consulta para ejecutarla directamente contra la base de datos Neo4j.
        </p>
      </div>

      {/* Grid de 6 tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUERIES.map((q) => {
          const isActive = activeId === q.id
          const isLoading = isActive && runQuery.isPending
          return (
            <button
              key={q.id}
              onClick={() => execute(q)}
              disabled={runQuery.isPending}
              className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-[#16161F] border-opacity-80'
                  : 'bg-[#16161F] border-[#252535] hover:border-opacity-60'
              }`}
              style={{
                borderColor: isActive ? q.color : undefined,
                boxShadow: isActive ? `0 0 0 1px ${q.color}40` : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{q.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: q.color }}
                    >
                      Query {q.id}
                    </span>
                    {isLoading && (
                      <span className="text-[10px] text-[#8888AA] animate-pulse">ejecutando...</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">{q.title}</p>
                  <p className="text-xs text-[#8888AA] leading-relaxed">{q.description}</p>
                </div>
              </div>

              {/* Código Cypher colapsado */}
              <pre className="mt-3 text-[10px] text-[#44445A] font-mono bg-[#090910] rounded-lg p-2 overflow-hidden whitespace-pre-wrap line-clamp-3 text-left">
                {q.query}
              </pre>
            </button>
          )
        })}
      </div>

      {/* Resultados */}
      {(runQuery.isPending || results.length > 0 || (activeId && !runQuery.isPending)) && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-[#252535]"
            style={{ borderLeftColor: activeQuery?.color, borderLeftWidth: 3 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{activeQuery?.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#F0F0FF]">{activeTitle}</p>
                {results.length > 0 && (
                  <p className="text-xs text-[#8888AA]">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            {results.length > 0 && (
              <button
                onClick={() => {
                  const csv = [columns.join(','), ...results.map((r) =>
                    columns.map((c) => JSON.stringify(r[c] ?? '')).join(',')
                  )].join('\n')
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                  a.download = `query-${activeId}.csv`
                  a.click()
                }}
                className="text-xs text-[#8888AA] hover:text-[#F0F0FF] px-3 py-1 rounded border border-[#252535] transition-colors"
              >
                Exportar CSV
              </button>
            )}
          </div>

          {runQuery.isPending ? (
            <LoadingSpinner className="py-12" />
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-[#44445A] text-sm">
              Sin resultados para esta consulta
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm min-w-max">
                <thead className="sticky top-0 bg-[#111118]">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="px-4 py-3 text-left text-xs font-medium text-[#8888AA] uppercase tracking-wider border-b border-[#252535]"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[#252535]/50 ${i % 2 === 0 ? 'bg-[#16161F]' : 'bg-[#111118]'}`}
                    >
                      {columns.map((c) => (
                        <td key={c} className="px-4 py-2.5 text-[#F0F0FF] font-mono text-xs">
                          {typeof row[c] === 'object'
                            ? JSON.stringify(row[c])
                            : String(row[c] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DataTable from '../../../components/common/DataTable'
import { nodesApi, type FilterCondition } from '../../../api/nodes.api'

type EntityLabel = 'User' | 'Song' | 'Playlist' | 'Post' | 'Genre'

const OPERATORS = [
  { value: 'eq',          label: '= Igual' },
  { value: 'ne',          label: '≠ Diferente' },
  { value: 'gt',          label: '> Mayor' },
  { value: 'gte',         label: '≥ Mayor o igual' },
  { value: 'lt',          label: '< Menor' },
  { value: 'lte',         label: '≤ Menor o igual' },
  { value: 'contains',    label: '⊃ Contiene' },
  { value: 'starts_with', label: '▷ Empieza con' },
  { value: 'ends_with',   label: '◁ Termina con' },
  { value: 'exists',      label: '✓ Existe' },
  { value: 'not_exists',  label: '✗ No existe' },
]

const NO_VALUE_OPS = ['exists', 'not_exists']

const SUGGESTED_FIELDS: Record<EntityLabel, string[]> = {
  User:     ['user_id', 'username', 'email', 'premium', 'fecha_registro', 'is_artist'],
  Song:     ['song_id', 'titulo', 'popularidad', 'duracion', 'fecha_lanzamiento'],
  Playlist: ['playlist_id', 'nombre', 'descripcion', 'publica', 'numero_canciones'],
  Post:     ['post_id', 'caption', 'tipo', 'privacidad', 'fecha'],
  Genre:    ['genre_id', 'nombre', 'descripcion', 'popularidad', 'origen'],
}

const emptyFilter = (): FilterCondition => ({ field: '', op: 'eq', value: '' })

export default function NodeListPanel() {
  const [entity, setEntity] = useState<EntityLabel>('User')
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [applied, setApplied] = useState<FilterCondition[]>([])
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(25)
  const [submitted, setSubmitted] = useState(true)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['node-search', entity, applied, skip, limit],
    queryFn: () => nodesApi.search(entity, applied, skip, limit),
    enabled: submitted,
  })

  const nodes: Record<string, unknown>[] = data?.nodes ?? []

  const addFilter = () => setFilters([...filters, emptyFilter()])

  const updateFilter = (i: number, patch: Partial<FilterCondition>) =>
    setFilters(filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))

  const removeFilter = (i: number) =>
    setFilters(filters.filter((_, idx) => idx !== i))

  const applyFilters = () => {
    const valid = filters.filter((f) => f.field.trim())
    setApplied(valid)
    setSkip(0)
    setSubmitted(true)
  }

  const clearFilters = () => {
    setFilters([])
    setApplied([])
    setSkip(0)
    setSubmitted(true)
  }

  const changeEntity = (e: EntityLabel) => {
    setEntity(e)
    setFilters([])
    setApplied([])
    setSkip(0)
    setSubmitted(true)
  }

  // Columnas dinámicas basadas en las claves de los primeros resultados
  const cols = nodes.length > 0
    ? Object.keys(nodes[0])
        .filter((k) => !['labels', 'connections'].includes(k))
        .slice(0, 7)
        .map((k) => ({
          key: k,
          header: k,
          sortable: true,
          render: (r: Record<string, unknown>) => {
            const v = r[k]
            if (Array.isArray(v)) return v.join(', ')
            if (typeof v === 'boolean') return v ? '✓' : '✗'
            return String(v ?? '-')
          },
        }))
    : [{ key: 'user_id', header: 'ID', sortable: true }]

  const suggested = SUGGESTED_FIELDS[entity]

  const inputCls = 'bg-[#090910] border border-[#252535] rounded-lg px-3 py-1.5 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF] placeholder-[#44445A]'

  return (
    <div className="space-y-4">

      {/* Selector de entidad + límite */}
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {(['User','Song','Playlist','Post','Genre'] as EntityLabel[]).map((e) => (
              <button
                key={e}
                onClick={() => changeEntity(e)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-[#8888AA]">Límite:</label>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setSkip(0) }}
              className={inputCls}
            >
              {[10, 25, 50, 100].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Constructor de filtros */}
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#F0F0FF] font-display">Filtros</h3>
          <button
            onClick={addFilter}
            className="text-xs text-[#7C6FFF] hover:text-violet-400 transition-colors border border-[#7C6FFF]/40 hover:border-[#7C6FFF] px-3 py-1 rounded-lg"
          >
            + Agregar filtro
          </button>
        </div>

        {filters.length === 0 ? (
          <p className="text-xs text-[#44445A] text-center py-3">
            Sin filtros — se muestran todos los nodos. Agrega uno para filtrar.
          </p>
        ) : (
          <div className="space-y-2">
            {filters.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">

                {/* Campo */}
                <div className="relative flex-1">
                  <input
                    list={`fields-${i}`}
                    value={f.field}
                    onChange={(e) => updateFilter(i, { field: e.target.value })}
                    placeholder="campo"
                    className={`${inputCls} w-full`}
                  />
                  <datalist id={`fields-${i}`}>
                    {suggested.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>

                {/* Operador */}
                <select
                  value={f.op}
                  onChange={(e) => updateFilter(i, { op: e.target.value })}
                  className={`${inputCls} w-44 shrink-0`}
                >
                  {OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* Valor */}
                {!NO_VALUE_OPS.includes(f.op) && (
                  <input
                    value={f.value}
                    onChange={(e) => updateFilter(i, { value: e.target.value })}
                    placeholder="valor"
                    className={`${inputCls} flex-1`}
                  />
                )}

                {/* Eliminar filtro */}
                <button
                  onClick={() => removeFilter(i)}
                  className="text-[#FF4455] hover:text-red-400 text-lg leading-none shrink-0 w-6 text-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="px-5 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors font-medium"
          >
            {isFetching ? 'Buscando...' : '🔍 Aplicar filtros'}
          </button>
          {applied.length > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors"
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Resumen de filtros activos */}
        {applied.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {applied.map((f, i) => (
              <span key={i} className="text-xs bg-[#7C6FFF]/15 border border-[#7C6FFF]/30 text-[#7C6FFF] px-2 py-0.5 rounded-full font-mono">
                {f.field} {OPERATORS.find((o) => o.value === f.op)?.label.split(' ')[0]}
                {!NO_VALUE_OPS.includes(f.op) && ` "${f.value}"`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <DataTable
        data={nodes}
        columns={cols}
        loading={isLoading || isFetching}
        keyField="element_id"
        pageSize={limit}
      />

      {/* Paginación */}
      <div className="flex gap-3 items-center">
        <button
          disabled={skip === 0}
          onClick={() => { setSkip(Math.max(0, skip - limit)); setSubmitted(true) }}
          className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors"
        >
          ← Anterior
        </button>
        <span className="text-sm text-[#44445A]">
          Mostrando {skip + 1}–{skip + nodes.length}
          {applied.length > 0 && ` · ${applied.length} filtro${applied.length > 1 ? 's' : ''} activo${applied.length > 1 ? 's' : ''}`}
        </span>
        <button
          disabled={nodes.length < limit}
          onClick={() => { setSkip(skip + limit); setSubmitted(true) }}
          className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

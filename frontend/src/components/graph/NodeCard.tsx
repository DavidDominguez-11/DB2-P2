import Badge from '../common/Badge'

interface Connection {
  rel_type: string
  rel_props: Record<string, unknown>
  neighbor: Record<string, unknown>
}

interface Props {
  node: { labels?: string[]; properties?: Record<string, unknown>; [key: string]: unknown }
}

// Campos que no se muestran en el grid de propiedades
const SKIP_KEYS = new Set(['labels', 'element_id', 'connections', '_labels', '_element_id'])

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (Array.isArray(v)) {
    // array de primitivos
    if (v.every((x) => typeof x !== 'object')) return v.join(', ')
    return `[${v.length} elementos]`
  }
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function NodeCard({ node }: Props) {
  const labels = (node.labels ?? node._labels) as string[] | undefined
  const raw = (node.properties ?? node) as Record<string, unknown>

  const props = Object.fromEntries(
    Object.entries(raw).filter(([k]) => !SKIP_KEYS.has(k))
  )

  const connections = raw.connections as Connection[] | undefined

  return (
    <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5 space-y-4">
      {/* Labels */}
      {labels && labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {labels.map((l) => <Badge key={l} label={l} />)}
        </div>
      )}

      {/* Propiedades */}
      {Object.keys(props).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(props).map(([k, v]) => (
            <div key={k} className="bg-[#090910] rounded-lg p-2">
              <span className="text-xs text-[#44445A] font-mono block mb-0.5">{k}</span>
              <span className="text-sm text-[#F0F0FF] font-mono break-all">
                {renderValue(v)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Connections */}
      {connections && connections.length > 0 && (
        <div>
          <p className="text-xs text-[#8888AA] uppercase tracking-wider mb-2">
            Conexiones ({connections.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {connections.map((c, i) => {
              const neighborLabels = (c.neighbor?.labels ?? c.neighbor?._labels ?? []) as string[]
              const neighborId = Object.entries(c.neighbor ?? {})
                .find(([k]) => k.endsWith('_id') && k !== 'element_id')?.[1]
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-[#090910] rounded-lg px-3 py-2 text-xs"
                >
                  <span className="text-[#7C6FFF] font-mono font-medium shrink-0">
                    {c.rel_type}
                  </span>
                  <span className="text-[#44445A]">→</span>
                  <span className="text-[#8888AA]">
                    {neighborLabels.length > 0 ? neighborLabels.join(':') : 'Nodo'}
                  </span>
                  {neighborId && (
                    <span className="text-[#F0F0FF] font-mono ml-auto">
                      {String(neighborId)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

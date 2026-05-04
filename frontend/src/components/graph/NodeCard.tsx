import Badge from '../common/Badge'

interface Props {
  node: { labels?: string[]; properties?: Record<string, unknown>; [key: string]: unknown }
}

export default function NodeCard({ node }: Props) {
  const labels = node.labels as string[] | undefined
  const props = (node.properties ?? node) as Record<string, unknown>

  return (
    <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
      {labels && labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {labels.map((l) => <Badge key={l} label={l} />)}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(props).map(([k, v]) => (
          <div key={k} className="bg-[#090910] rounded-lg p-2">
            <span className="text-xs text-[#44445A] font-mono block">{k}</span>
            <span className="text-sm text-[#F0F0FF] font-mono break-all">
              {Array.isArray(v) ? v.join(', ') : String(v ?? '-')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

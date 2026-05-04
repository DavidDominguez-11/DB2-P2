import { NODE_LABELS, type NodeLabel } from '../../types/graph.types'

interface Props {
  selected: string[]
  onChange: (labels: string[]) => void
  error?: string
}

export default function LabelSelector({ selected, onChange, error }: Props) {
  const toggle = (label: NodeLabel) => {
    if (selected.includes(label)) {
      onChange(selected.filter((l) => l !== label))
    } else {
      onChange([...selected, label])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {NODE_LABELS.map((label) => {
          const active = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white'
                  : 'bg-transparent border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-[#FF4455] mt-1">{error}</p>}
    </div>
  )
}

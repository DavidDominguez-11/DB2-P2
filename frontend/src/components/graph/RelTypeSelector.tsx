import { REL_TYPES } from '../../types/api.types'

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
}

export default function RelTypeSelector({ value, onChange, error }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {REL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              value === t
                ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]'
                : 'border-[#252535] text-[#8888AA] hover:border-[#00E5CC]/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        value={REL_TYPES.includes(value as (typeof REL_TYPES)[number]) ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O escribe un tipo personalizado..."
        className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#00E5CC]"
      />
      {error && <p className="text-xs text-[#FF4455] mt-1">{error}</p>}
    </div>
  )
}

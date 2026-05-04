interface Props {
  title: string
  value: string | number
  icon?: string
  color?: string
  subtitle?: string
}

export default function StatCard({ title, value, icon, color = '#7C6FFF', subtitle }: Props) {
  return (
    <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5 hover:border-[#7C6FFF]/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#8888AA] uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-[#44445A] mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl opacity-70">{icon}</span>}
      </div>
    </div>
  )
}

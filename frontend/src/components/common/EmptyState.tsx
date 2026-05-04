interface Props { message?: string; icon?: string }

export default function EmptyState({ message = 'Sin resultados', icon = '🔍' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#8888AA]">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}

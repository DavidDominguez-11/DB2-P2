const LABEL_COLORS: Record<string, string> = {
  User: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  Artist: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  Song: 'bg-green-900/40 text-green-300 border-green-700/50',
  Playlist: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  Post: 'bg-pink-900/40 text-pink-300 border-pink-700/50',
  Genre: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  Influencer: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  Moderator: 'bg-red-900/40 text-red-300 border-red-700/50',
}

interface Props { label: string; className?: string }

export default function Badge({ label, className = '' }: Props) {
  const color = LABEL_COLORS[label] ?? 'bg-[#252535] text-[#8888AA] border-[#252535]'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}>
      {label}
    </span>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="h-14 bg-[#111118] border-b border-[#252535] flex items-center px-6 gap-4 sticky top-0 z-40">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuarios, canciones, géneros..."
            className="w-full bg-[#16161F] border border-[#252535] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] transition-colors"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-[#44445A] font-mono">Neo4j Graph DB</span>
        <div className="w-2 h-2 rounded-full bg-[#22D3A0] animate-pulse" title="Conectado" />
      </div>
    </header>
  )
}

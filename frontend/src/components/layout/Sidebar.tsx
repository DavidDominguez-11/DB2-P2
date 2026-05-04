import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

const NAV = [
  { to: '/', icon: '🏠', label: 'Feed' },
  { to: '/explore', icon: '🔭', label: 'Explorar' },
  { to: '/playlists', icon: '🎵', label: 'Playlists' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/graph-manager', icon: '🕸️', label: 'Graph Manager' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={`flex flex-col h-screen bg-[#111118] border-r border-[#252535] transition-all duration-200 sticky top-0 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#252535]">
        {!sidebarCollapsed && (
          <span className="font-display font-bold text-[#7C6FFF] text-lg tracking-tight">ParaMetrix</span>
        )}
        <button
          onClick={toggleSidebar}
          className="text-[#8888AA] hover:text-[#F0F0FF] transition-colors ml-auto"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#7C6FFF]/15 text-[#7C6FFF] font-medium'
                  : 'text-[#8888AA] hover:bg-[#252535]/50 hover:text-[#F0F0FF]'
              }`
            }
          >
            <span className="text-base shrink-0">{icon}</span>
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[#252535]">
        <NavLink
          to="/profile/me"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-[#7C6FFF]/15 text-[#7C6FFF]' : 'text-[#8888AA] hover:bg-[#252535]/50 hover:text-[#F0F0FF]'
            }`
          }
        >
          <span className="text-base shrink-0">👤</span>
          {!sidebarCollapsed && <span>Perfil</span>}
        </NavLink>
      </div>
    </aside>
  )
}

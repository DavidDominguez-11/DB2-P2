import { NavLink } from 'react-router-dom'
import { Home, Compass, Radio, LayoutGrid, Settings, Zap, Music2 } from 'lucide-react'
import { useApp } from '../../store/AppContext'

const navItems = [
  { to: '/',        icon: Home,       label: 'Feed' },
  { to: '/discover',icon: Compass,    label: 'Descubrir' },
  { to: '/explorer',icon: Radio,      label: 'Explorador' },
  { to: '/nodes',   icon: LayoutGrid, label: 'Nodos' },
  { to: '/admin',   icon: Settings,   label: 'Admin' },
]

export default function Sidebar() {
  const { user } = useApp()

  return (
    <aside className="fixed left-0 top-0 h-full w-16 lg:w-56 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 lg:p-5 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 animate-pulse-glow">
          <Music2 size={16} className="text-white" />
        </div>
        <span className="hidden lg:block font-display font-bold text-lg text-text-primary tracking-tight">
          Para<span className="text-accent">Metrix</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isActive
                ? 'bg-accent/15 text-accent-bright border border-accent/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-muted/50'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden lg:block text-sm font-body font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User chip */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{user.username[0].toUpperCase()}</span>
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{user.username}</p>
            {user.premium && (
              <span className="text-[10px] text-neon font-mono flex items-center gap-1">
                <Zap size={9} /> PREMIUM
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/graph-manager/node-builder', label: '🔨 Node Builder' },
  { to: '/graph-manager/node-explorer', label: '🔍 Node Explorer' },
  { to: '/graph-manager/property-manager', label: '⚙️ Property Manager' },
  { to: '/graph-manager/relationship-builder', label: '🔗 Relationship Builder' },
  { to: '/graph-manager/relationship-manager', label: '🛠️ Relationship Manager' },
  { to: '/graph-manager/delete-panel', label: '🗑️ Delete Panel' },
  { to: '/graph-manager/cypher-console', label: '💻 Cypher Console' },
]

export default function GraphManager() {
  const location = useLocation()
  const isRoot = location.pathname === '/graph-manager'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold font-display text-[#F0F0FF]">Graph Manager</h1>
          <p className="text-sm text-[#8888AA]">Control total del grafo Neo4j</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#44445A]">
          <div className="w-2 h-2 rounded-full bg-[#7C6FFF] animate-pulse" />
          <span className="font-mono">Neo4j</span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 flex-wrap border-b border-[#252535] pb-3">
        {TABS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-[#7C6FFF] text-white font-medium'
                  : 'text-[#8888AA] hover:bg-[#252535]/50 hover:text-[#F0F0FF]'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {isRoot ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TABS.map(({ to, label }) => (
            <NavLink key={to} to={to} className="bg-[#16161F] border border-[#252535] rounded-xl p-6 hover:border-[#7C6FFF]/40 transition-colors text-center">
              <p className="text-2xl mb-2">{label.split(' ')[0]}</p>
              <p className="text-sm font-medium text-[#F0F0FF]">{label.split(' ').slice(1).join(' ')}</p>
            </NavLink>
          ))}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  )
}

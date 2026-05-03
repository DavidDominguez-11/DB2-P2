import { X, Loader2 } from 'lucide-react'

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:  'bg-accent hover:bg-accent-bright text-white',
    secondary:'bg-muted hover:bg-muted/80 text-text-primary border border-border',
    ghost:    'bg-transparent hover:bg-muted/50 text-text-secondary hover:text-text-primary',
    danger:   'bg-rose/15 hover:bg-rose/25 text-rose border border-rose/30',
    neon:     'bg-neon/15 hover:bg-neon/25 text-neon border border-neon/30',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-secondary font-body">{label}</label>}
      <input
        className={`bg-muted border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors font-body ${className}`}
        {...props}
      />
    </div>
  )
}

// ─── SELECT ──────────────────────────────────────────────────────────────────
export function Select({ label, options, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-secondary font-body">{label}</label>}
      <select
        className={`bg-muted border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors font-body ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent:  'bg-accent/15 text-accent-bright border-accent/20',
    neon:    'bg-neon/15 text-neon border-neon/20',
    rose:    'bg-rose/15 text-rose border-rose/20',
    amber:   'bg-amber/15 text-amber border-amber/20',
    sky:     'bg-sky/15 text-sky border-sky/20',
    purple:  'bg-purple-400/15 text-purple-300 border-purple-400/20',
    muted:   'bg-muted text-text-secondary border-border',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${colors[color]}`}>
      {children}
    </span>
  )
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass rounded-2xl border border-border ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'} max-h-[85vh] overflow-y-auto animate-fade-up`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-text-secondary hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── LOADER ──────────────────────────────────────────────────────────────────
export function Loader({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-text-muted font-body">{text}</p>
    </div>
  )
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`card-hover rounded-xl border p-4 ${accent ? 'bg-accent/10 border-accent/30' : 'bg-panel border-border'}`}>
      <p className="text-xs text-text-secondary font-body mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold ${accent ? 'gradient-text' : 'text-text-primary'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1 font-body">{sub}</p>}
    </div>
  )
}

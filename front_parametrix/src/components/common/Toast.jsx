import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../store/AppContext'

const icons = {
  success: <CheckCircle size={16} className="text-neon" />,
  error:   <AlertCircle size={16} className="text-rose" />,
  info:    <Info size={16} className="text-accent-bright" />,
}
const colors = {
  success: 'border-neon/30 bg-neon/5',
  error:   'border-rose/30 bg-rose/5',
  info:    'border-accent/30 bg-accent/5',
}

export default function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-fade-up flex items-center gap-3 px-4 py-3 rounded-xl glass border ${colors[t.type]} min-w-[240px] max-w-xs pointer-events-auto`}
        >
          {icons[t.type]}
          <p className="text-sm text-text-primary font-body flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  )
}

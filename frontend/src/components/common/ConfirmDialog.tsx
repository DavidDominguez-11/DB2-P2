import Modal from './Modal'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  danger?: boolean
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro? Esta acción no se puede deshacer.',
  danger = false,
  loading = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[#8888AA] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-[#252535] text-[#8888AA] hover:text-[#F0F0FF] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
            danger
              ? 'bg-[#FF4455] hover:bg-red-500 text-white'
              : 'bg-[#7C6FFF] hover:bg-violet-500 text-white'
          }`}
        >
          {loading ? 'Procesando...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  )
}

import { useForm } from 'react-hook-form'
import Modal from '../../components/common/Modal'
import { useUpdateUser } from '../../hooks/useUsers'

interface Props { open: boolean; onClose: () => void; userId: string }

export default function EditProfileModal({ open, onClose, userId }: Props) {
  const { register, handleSubmit, reset } = useForm<Record<string, string>>()
  const update = useUpdateUser()

  const onSubmit = (data: Record<string, string>) => {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== ''))
    update.mutate({ id: userId, data: clean }, { onSuccess: () => { reset(); onClose() } })
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Username</label>
          <input {...register('username')} placeholder="Nuevo username" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
        </div>
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Email</label>
          <input {...register('email')} type="email" placeholder="Nuevo email" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors">Cancelar</button>
          <button type="submit" disabled={update.isPending} className="px-4 py-2 text-sm bg-[#7C6FFF] hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50">
            {update.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

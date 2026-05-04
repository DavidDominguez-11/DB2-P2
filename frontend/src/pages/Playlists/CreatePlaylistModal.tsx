import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import Modal from '../../components/common/Modal'
import { useCreatePlaylist } from '../../hooks/usePlaylists'

interface PlaylistForm {
  nombre: string
  descripcion: string
  fecha_creacion: string
  publica: boolean
  numero_canciones: number
  is_featured: boolean
}

const schema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().min(1, 'Requerido'),
  fecha_creacion: z.string().min(1, 'Requerido'),
  publica: z.boolean(),
  numero_canciones: z.coerce.number(),
  is_featured: z.boolean(),
})

type Form = PlaylistForm

interface Props { open: boolean; onClose: () => void }

export default function CreatePlaylistModal({ open, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema) as import('react-hook-form').Resolver<Form>,
    defaultValues: { publica: true, numero_canciones: 0, is_featured: false },
  })
  const create = useCreatePlaylist()

  const onSubmit = (data: Form) => {
    create.mutate(
      { playlist_id: uuid(), ...data },
      { onSuccess: () => { reset(); onClose() } }
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva Playlist">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Nombre *</label>
          <input {...register('nombre')} placeholder="Mi Playlist" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
          {errors.nombre && <p className="text-xs text-[#FF4455] mt-0.5">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Descripción *</label>
          <textarea {...register('descripcion')} rows={2} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] resize-none" />
          {errors.descripcion && <p className="text-xs text-[#FF4455] mt-0.5">{errors.descripcion.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Fecha creación *</label>
            <input type="date" {...register('fecha_creacion')} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]" />
          </div>
          <div>
            <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Nº Canciones</label>
            <input type="number" {...register('numero_canciones')} className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]" />
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-[#8888AA] cursor-pointer">
            <input type="checkbox" {...register('publica')} className="accent-[#7C6FFF]" />
            Pública
          </label>
          <label className="flex items-center gap-2 text-sm text-[#8888AA] cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="accent-[#7C6FFF]" />
            Destacada
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors">Cancelar</button>
          <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm bg-[#7C6FFF] hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50">
            {create.isPending ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

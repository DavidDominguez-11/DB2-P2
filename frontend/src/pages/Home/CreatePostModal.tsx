import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import Modal from '../../components/common/Modal'
import { useCreatePost } from '../../hooks/usePosts'

const schema = z.object({
  user_id: z.string().min(1, 'Requerido — es tu ID de usuario'),
  caption: z.string().min(10, 'Mínimo 10 caracteres'),
  fecha: z.string(),
  tipo: z.enum(['song', 'playlist', 'update', 'event']),
  privacidad: z.string(),
  hashtags: z.string().optional(),
})

type Form = z.infer<typeof schema>

const today = () => new Date().toISOString().split('T')[0]

interface Props { open: boolean; onClose: () => void }

export default function CreatePostModal({ open, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'update', privacidad: 'public', fecha: today() },
  })
  const create = useCreatePost()

  const onSubmit = (data: Form) => {
    create.mutate(
      {
        post_id: uuid(),
        user_id: data.user_id,
        caption: data.caption,
        fecha: data.fecha || today(),
        tipo: data.tipo,
        privacidad: data.privacidad,
        hashtags: data.hashtags ? data.hashtags.split(',').map((h) => h.trim()).filter(Boolean) : [],
      },
      { onSuccess: () => { reset({ tipo: 'update', privacidad: 'public', fecha: today() }); onClose() } }
    )
  }

  const inputCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Post">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* User ID del autor */}
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">
            Tu User ID *
          </label>
          <input
            {...register('user_id')}
            placeholder="ID del usuario que publica"
            className={inputCls}
          />
          {errors.user_id && <p className="text-xs text-[#FF4455] mt-0.5">{errors.user_id.message}</p>}
          <p className="text-[10px] text-[#44445A] mt-1">
            Aparecerá como autor del post en el feed
          </p>
        </div>

        {/* Caption */}
        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Caption *</label>
          <textarea
            {...register('caption')}
            rows={3}
            placeholder="¿Qué estás escuchando?"
            className={`${inputCls} resize-none`}
          />
          {errors.caption && <p className="text-xs text-[#FF4455] mt-0.5">{errors.caption.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Tipo *</label>
            <select {...register('tipo')} className={inputCls}>
              <option value="song">Canción</option>
              <option value="playlist">Playlist</option>
              <option value="update">Actualización</option>
              <option value="event">Evento</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">Privacidad</label>
            <select {...register('privacidad')} className={inputCls}>
              <option value="public">Público</option>
              <option value="private">Privado</option>
              <option value="friends">Amigos</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">
            Fecha <span className="text-[#44445A] normal-case">(vacío = hoy)</span>
          </label>
          <input type="date" {...register('fecha')} className={inputCls} />
        </div>

        <div>
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-1 block">
            Hashtags <span className="text-[#44445A] normal-case">(separados por coma)</span>
          </label>
          <input {...register('hashtags')} placeholder="musica, rock, indie" className={inputCls} />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="px-4 py-2 text-sm bg-[#7C6FFF] hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {create.isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

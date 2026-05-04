import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import RelTypeSelector from '../../../components/graph/RelTypeSelector'
import JsonViewer from '../../../components/common/JsonViewer'
import { useCreateInteraction } from '../../../hooks/useInteractions'
import { ENTITY_LABELS } from '../../../types/api.types'

// Propiedades sugeridas por tipo de relación
const REL_DEFAULTS: Record<string, { key: string; value: string }[]> = {
  FOLLOWS: [
    { key: 'fecha',           value: new Date().toISOString().split('T')[0] },
    { key: 'notificaciones',  value: 'true' },
    { key: 'plataforma',      value: 'web' },
  ],
  LISTENED: [
    { key: 'fecha',            value: new Date().toISOString().split('T')[0] },
    { key: 'duracion_escucha', value: '180' },
    { key: 'plataforma',       value: 'web' },
    { key: 'dispositivo',      value: 'desktop' },
  ],
  LIKED: [
    { key: 'fecha',       value: new Date().toISOString().split('T')[0] },
    { key: 'plataforma',  value: 'web' },
    { key: 'contexto',    value: 'feed' },
  ],
  CONTAINS: [
    { key: 'fecha_agregado', value: new Date().toISOString().split('T')[0] },
    { key: 'posicion',       value: '1' },
    { key: 'agregado_por',   value: 'usuario' },
  ],
  POSTED: [
    { key: 'fecha',      value: new Date().toISOString().split('T')[0] },
    { key: 'plataforma', value: 'web' },
    { key: 'visible',    value: 'true' },
  ],
  BELONGS_TO: [
    { key: 'fecha_asignacion', value: new Date().toISOString().split('T')[0] },
    { key: 'rol',              value: 'miembro' },
    { key: 'activo',           value: 'true' },
  ],
  FEATURED_IN: [
    { key: 'fecha',    value: new Date().toISOString().split('T')[0] },
    { key: 'posicion', value: '1' },
    { key: 'activo',   value: 'true' },
  ],
  COLLABORATED_WITH: [
    { key: 'fecha_colaboracion', value: new Date().toISOString().split('T')[0] },
    { key: 'rol',                value: 'artista' },
    { key: 'activo',             value: 'true' },
  ],
}

const EMPTY_PROPS = [
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
]

const schema = z.object({
  from_label: z.string().min(1),
  from_id:    z.string().min(1, 'Requerido'),
  to_label:   z.string().min(1),
  to_id:      z.string().min(1, 'Requerido'),
  rel_type:   z.string().min(1, 'Requerido'),
  props: z
    .array(z.object({ key: z.string().min(1, 'Clave requerida'), value: z.string() }))
    .min(3, 'Mínimo 3 propiedades'),
})

type Form = z.infer<typeof schema>

export default function RelationshipBuilder() {
  const [relType, setRelType] = useState('FOLLOWS')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const create = useCreateInteraction()

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      from_label: 'User',
      to_label:   'User',
      rel_type:   'FOLLOWS',
      props:      REL_DEFAULTS['FOLLOWS'],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'props' })

  const handleRelTypeChange = (v: string) => {
    setRelType(v)
    setValue('rel_type', v)
    // Carga propiedades sugeridas si existen para este tipo
    const suggested = REL_DEFAULTS[v]
    if (suggested) {
      replace(suggested)
    }
  }

  const onSubmit = (data: Form) => {
    const properties = Object.fromEntries(
      data.props.filter((p) => p.key).map((p) => [p.key, p.value])
    )
    create.mutate(
      {
        from_label: data.from_label,
        from_id:    data.from_id,
        to_label:   data.to_label,
        to_id:      data.to_id,
        rel_type:   relType,
        properties,
      },
      {
        onSuccess: (r) => {
          setResult(r)
          reset({
            from_label: 'User', to_label: 'User', rel_type: relType,
            props: REL_DEFAULTS[relType] ?? EMPTY_PROPS,
          })
        },
      }
    )
  }

  const inputCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Crear Relación</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Nodos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#090910] rounded-xl p-4 border border-[#252535]">
              <p className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">Nodo Origen</p>
              <div className="space-y-2">
                <select {...register('from_label')} className={inputCls}>
                  {Object.values(ENTITY_LABELS).map((l) => <option key={l}>{l}</option>)}
                </select>
                <input {...register('from_id')} placeholder="ID del nodo origen" className={inputCls} />
                {errors.from_id && <p className="text-xs text-[#FF4455]">{errors.from_id.message}</p>}
              </div>
            </div>
            <div className="bg-[#090910] rounded-xl p-4 border border-[#252535]">
              <p className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">Nodo Destino</p>
              <div className="space-y-2">
                <select {...register('to_label')} className={inputCls}>
                  {Object.values(ENTITY_LABELS).map((l) => <option key={l}>{l}</option>)}
                </select>
                <input {...register('to_id')} placeholder="ID del nodo destino" className={inputCls} />
                {errors.to_id && <p className="text-xs text-[#FF4455]">{errors.to_id.message}</p>}
              </div>
            </div>
          </div>

          {/* Tipo de relación */}
          <div>
            <p className="text-xs text-[#8888AA] uppercase tracking-wider mb-2">Tipo de Relación *</p>
            <RelTypeSelector
              value={relType}
              onChange={handleRelTypeChange}
              error={errors.rel_type?.message}
            />
          </div>

          {/* Propiedades */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#8888AA] uppercase tracking-wider">Propiedades (mín. 3) *</p>
                {REL_DEFAULTS[relType] && (
                  <span className="text-xs bg-[#7C6FFF]/15 text-[#7C6FFF] border border-[#7C6FFF]/30 px-2 py-0.5 rounded-full">
                    auto-completadas
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => append({ key: '', value: '' })}
                className="text-xs text-[#7C6FFF] hover:text-violet-400 transition-colors"
              >
                + Agregar
              </button>
            </div>

            {errors.props && typeof errors.props === 'object' && 'message' in errors.props && (
              <p className="text-xs text-[#FF4455] mb-2">{String(errors.props.message)}</p>
            )}

            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    {...register(`props.${i}.key`)}
                    placeholder="clave"
                    className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
                  />
                  <input
                    {...register(`props.${i}.value`)}
                    placeholder="valor"
                    className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
                  />
                  {fields.length > 3 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-[#FF4455] hover:text-red-400 text-lg leading-none w-5 text-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-[#44445A] mt-2">
              Edita los valores de las propiedades según necesites.
            </p>
          </div>

          <button
            type="submit"
            disabled={create.isPending}
            className="px-6 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {create.isPending ? 'Creando...' : 'Crear Relación'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-[#16161F] border border-[#22D3A0]/30 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-[#22D3A0] mb-3">Relación creada</h4>
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

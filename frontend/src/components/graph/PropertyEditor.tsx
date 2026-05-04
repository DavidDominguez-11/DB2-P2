import { useFieldArray, useFormContext } from 'react-hook-form'

interface Props {
  name: string
  minCount?: number
}

export default function PropertyEditor({ name, minCount = 5 }: Props) {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-[#8888AA] uppercase tracking-wider">
          Propiedades (mín. {minCount})
        </label>
        <button
          type="button"
          onClick={() => append({ key: '', value: '', type: 'string' })}
          className="text-xs text-[#7C6FFF] hover:text-violet-400 transition-colors"
        >
          + Agregar
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              {...register(`${name}.${index}.key`)}
              placeholder="clave"
              className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
            />
            <input
              {...register(`${name}.${index}.value`)}
              placeholder="valor"
              className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]"
            />
            <select
              {...register(`${name}.${index}.type`)}
              className="bg-[#090910] border border-[#252535] rounded-lg px-2 py-2 text-sm text-[#8888AA] focus:outline-none focus:border-[#7C6FFF]"
            >
              <option value="string">str</option>
              <option value="number">num</option>
              <option value="boolean">bool</option>
              <option value="date">date</option>
            </select>
            {fields.length > minCount && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-[#FF4455] hover:text-red-400 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {Boolean((errors as Record<string, unknown>)[name]) && (
        <p className="text-xs text-[#FF4455] mt-1">Mínimo {minCount} propiedades requeridas</p>
      )}
    </div>
  )
}

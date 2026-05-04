import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LabelSelector from '../../../components/graph/LabelSelector'
import PropertyEditor from '../../../components/graph/PropertyEditor'
import JsonViewer from '../../../components/common/JsonViewer'
import { useCreateNode } from '../../../hooks/useNodes'

const schema = z.object({
  props: z.array(z.object({ key: z.string().min(1), value: z.string(), type: z.string() })).min(5, 'Mínimo 5 propiedades'),
})

type Form = z.infer<typeof schema>

const parseValue = (value: string, type: string): unknown => {
  if (type === 'number') return Number(value)
  if (type === 'boolean') return value === 'true'
  if (type === 'date') return value
  return value
}

export default function MultiLabelForm() {
  const [labels, setLabels] = useState<string[]>(['User'])
  const [labelsError, setLabelsError] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const createNode = useCreateNode()

  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      props: Array.from({ length: 5 }, () => ({ key: '', value: '', type: 'string' })),
    },
  })

  const onSubmit = (data: Form) => {
    if (labels.length === 0) { setLabelsError('Selecciona al menos 1 label'); return }
    setLabelsError('')
    const properties = Object.fromEntries(
      data.props.filter((p) => p.key).map((p) => [p.key, parseValue(p.value, p.type)])
    )
    createNode.mutate(
      { labels, properties },
      { onSuccess: (res) => setResult(res) }
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Crear Nodo Multi-Label</h3>
        <p className="text-xs text-[#8888AA] mb-4">
          Usa <code className="bg-[#090910] px-1 rounded text-[#7C6FFF]">POST /api/v1/nodes</code> con múltiples labels
        </p>

        <div className="mb-5">
          <label className="text-xs text-[#8888AA] uppercase tracking-wider mb-2 block">Labels *</label>
          <LabelSelector selected={labels} onChange={setLabels} error={labelsError} />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <PropertyEditor name="props" minCount={5} />

            <div className="flex justify-end">
              <button type="submit" disabled={createNode.isPending}
                className="px-6 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {createNode.isPending ? 'Creando...' : 'Crear Nodo'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>

      {result && (
        <div className="bg-[#16161F] border border-[#22D3A0]/30 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-[#22D3A0] mb-3">Nodo creado</h4>
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

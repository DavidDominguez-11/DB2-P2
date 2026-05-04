import { useState } from 'react'
import { useBulkUpdateNodes, useBulkRemoveNodeProperty } from '../../../hooks/useBulk'
import JsonViewer from '../../../components/common/JsonViewer'

// Convierte un string al tipo Python/Neo4j más apropiado
function coerce(v: string): unknown {
  if (v.trim() === '') return v
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  const n = Number(v)
  if (!isNaN(n) && v.trim() !== '') return n
  return v
}

// Etiqueta del tipo inferido (para mostrar al usuario)
function typeLabel(v: string): { text: string; color: string } {
  if (v.trim() === '') return { text: '', color: '' }
  if (v.toLowerCase() === 'true' || v.toLowerCase() === 'false')
    return { text: 'bool', color: 'text-[#7C6FFF]' }
  if (!isNaN(Number(v)) && v.trim() !== '')
    return { text: 'número', color: 'text-[#00E5CC]' }
  return { text: 'texto', color: 'text-[#8888AA]' }
}

function TypedInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const tl = typeLabel(value)
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {tl.text && (
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono pointer-events-none ${tl.color}`}>
          {tl.text}
        </span>
      )}
    </div>
  )
}

export default function BulkPropertyOps() {
  const [mode, setMode] = useState<'update' | 'remove'>('update')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const [updateForm, setUpdateForm] = useState({
    label: 'User',
    filter_property: '',
    filter_value: '',
    update_key: '',
    update_value: '',
  })
  const [removeForm, setRemoveForm] = useState({
    label: 'User',
    property_to_remove: '',
    filter_property: '',
    filter_value: '',
  })

  const bulkUpdate = useBulkUpdateNodes()
  const bulkRemove = useBulkRemoveNodeProperty()

  const handleUpdate = () => {
    bulkUpdate.mutate(
      {
        label: updateForm.label,
        filter_property: updateForm.filter_property,
        filter_value: coerce(updateForm.filter_value),
        update_data: { [updateForm.update_key]: coerce(updateForm.update_value) },
      },
      { onSuccess: (r) => setResult(r as Record<string, unknown>) }
    )
  }

  const handleRemove = () => {
    bulkRemove.mutate(
      {
        label: removeForm.label,
        property_to_remove: removeForm.property_to_remove,
        filter_property: removeForm.filter_property || undefined,
        filter_value: removeForm.filter_value ? coerce(removeForm.filter_value) : undefined,
      },
      { onSuccess: (r) => setResult(r as Record<string, unknown>) }
    )
  }

  const input = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 pr-14 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'
  const inputNoTag = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">
          Operaciones Masivas de Propiedades
        </h3>
        <p className="text-xs text-[#44445A] mb-4">
          Los valores numéricos, booleanos y texto se detectan automáticamente.
        </p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode('update')}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === 'update' ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]' : 'border-[#252535] text-[#8888AA]'}`}
          >
            Bulk Update
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === 'remove' ? 'bg-[#FF4455]/15 border-[#FF4455] text-[#FF4455]' : 'border-[#252535] text-[#8888AA]'}`}
          >
            Bulk Remove Property
          </button>
        </div>

        {mode === 'update' ? (
          <div className="space-y-3">
            <p className="text-xs text-[#8888AA]">
              Actualiza una propiedad en todos los nodos que cumplan el filtro
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Label */}
              <div className="col-span-2">
                <label className="text-xs text-[#8888AA] mb-1 block">Label</label>
                <select
                  value={updateForm.label}
                  onChange={(e) => setUpdateForm({ ...updateForm, label: e.target.value })}
                  className={inputNoTag}
                >
                  {['User', 'Song', 'Playlist', 'Post', 'Genre'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Filtro */}
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property</label>
                <input
                  value={updateForm.filter_property}
                  onChange={(e) => setUpdateForm({ ...updateForm, filter_property: e.target.value })}
                  placeholder="ej: duracion"
                  className={inputNoTag}
                />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value
                  {updateForm.filter_value && (
                    <span className={`ml-2 ${typeLabel(updateForm.filter_value).color}`}>
                      → {typeLabel(updateForm.filter_value).text}
                    </span>
                  )}
                </label>
                <TypedInput
                  value={updateForm.filter_value}
                  onChange={(v) => setUpdateForm({ ...updateForm, filter_value: v })}
                  placeholder="ej: 4"
                  className={input}
                />
              </div>

              {/* Actualización */}
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Update Key</label>
                <input
                  value={updateForm.update_key}
                  onChange={(e) => setUpdateForm({ ...updateForm, update_key: e.target.value })}
                  placeholder="propiedad a actualizar"
                  className={inputNoTag}
                />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Update Value
                  {updateForm.update_value && (
                    <span className={`ml-2 ${typeLabel(updateForm.update_value).color}`}>
                      → {typeLabel(updateForm.update_value).text}
                    </span>
                  )}
                </label>
                <TypedInput
                  value={updateForm.update_value}
                  onChange={(v) => setUpdateForm({ ...updateForm, update_value: v })}
                  placeholder="nuevo valor"
                  className={input}
                />
              </div>
            </div>

            {/* Preview del payload */}
            {updateForm.filter_property && updateForm.update_key && (
              <div className="bg-[#090910] rounded-lg p-3 font-mono text-xs text-[#8888AA] border border-[#252535]">
                <span className="text-[#44445A]">Se actualizará:</span>{' '}
                <span className="text-[#F0F0FF]">{updateForm.label}</span>
                {' '}donde{' '}
                <span className="text-[#00E5CC]">{updateForm.filter_property}</span>
                {' = '}
                <span className="text-[#7C6FFF]">
                  {JSON.stringify(coerce(updateForm.filter_value))}
                </span>
                {' → set '}
                <span className="text-[#00E5CC]">{updateForm.update_key}</span>
                {' = '}
                <span className="text-[#7C6FFF]">
                  {JSON.stringify(coerce(updateForm.update_value))}
                </span>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={bulkUpdate.isPending || !updateForm.filter_property || !updateForm.update_key}
              className="px-5 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkUpdate.isPending ? 'Procesando...' : 'Ejecutar Bulk Update'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#8888AA]">
              Elimina una propiedad de todos los nodos del label (filtro opcional)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[#8888AA] mb-1 block">Label</label>
                <select
                  value={removeForm.label}
                  onChange={(e) => setRemoveForm({ ...removeForm, label: e.target.value })}
                  className={inputNoTag}
                >
                  {['User', 'Song', 'Playlist', 'Post', 'Genre'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-[#8888AA] mb-1 block">Property to Remove</label>
                <input
                  value={removeForm.property_to_remove}
                  onChange={(e) => setRemoveForm({ ...removeForm, property_to_remove: e.target.value })}
                  placeholder="propiedad a eliminar"
                  className={inputNoTag}
                />
              </div>

              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property (opcional)</label>
                <input
                  value={removeForm.filter_property}
                  onChange={(e) => setRemoveForm({ ...removeForm, filter_property: e.target.value })}
                  placeholder="propiedad"
                  className={inputNoTag}
                />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value (opcional)
                  {removeForm.filter_value && (
                    <span className={`ml-2 ${typeLabel(removeForm.filter_value).color}`}>
                      → {typeLabel(removeForm.filter_value).text}
                    </span>
                  )}
                </label>
                <TypedInput
                  value={removeForm.filter_value}
                  onChange={(v) => setRemoveForm({ ...removeForm, filter_value: v })}
                  placeholder="valor"
                  className={input}
                />
              </div>
            </div>

            <button
              onClick={handleRemove}
              disabled={bulkRemove.isPending || !removeForm.property_to_remove}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkRemove.isPending ? 'Procesando...' : 'Ejecutar Bulk Remove'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

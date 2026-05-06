import { useState, type ReactNode } from 'react'
import { useBulkUpdateNodes, useBulkRemoveNodeProperty } from '../../../hooks/useBulk'
import JsonViewer from '../../../components/common/JsonViewer'

function coerce(v: string): unknown {
  if (v.trim() === '') return v
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  const n = Number(v)
  if (!isNaN(n) && v.trim() !== '') return n
  return v
}

function typeLabel(v: string): { text: string; color: string } {
  if (v.trim() === '') return { text: '', color: '' }
  if (v.toLowerCase() === 'true' || v.toLowerCase() === 'false')
    return { text: 'bool', color: 'text-[#7C6FFF]' }
  if (!isNaN(Number(v)) && v.trim() !== '')
    return { text: 'número', color: 'text-[#00E5CC]' }
  return { text: 'texto', color: 'text-[#8888AA]' }
}

function TypedInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  const tl = typeLabel(value)
  return (
    <div className="relative">
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={className} />
      {tl.text && (
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono pointer-events-none ${tl.color}`}>{tl.text}</span>
      )}
    </div>
  )
}

type Mode = 'create' | 'update' | 'remove'

const LABELS = ['User', 'Song', 'Playlist', 'Post', 'Genre']

export default function BulkPropertyOps() {
  const [mode, setMode] = useState<Mode>('create')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  // Crear: agregar nueva propiedad a todos los nodos del label (sin filtro obligatorio)
  const [createForm, setCreateF] = useState({ label: 'User', new_key: '', new_value: '', filter_property: '', filter_value: '' })

  // Actualizar: cambiar propiedad existente
  const [updateForm, setUpdateF] = useState({ label: 'User', filter_property: '', filter_value: '', update_key: '', update_value: '' })

  // Eliminar: quitar propiedad
  const [removeForm, setRemoveF] = useState({ label: 'User', property_to_remove: '', filter_property: '', filter_value: '' })

  const bulkUpdate = useBulkUpdateNodes()
  const bulkRemove = useBulkRemoveNodeProperty()

  const handleCreate = () => {
    if (!createForm.new_key) return
    bulkUpdate.mutate({
      label: createForm.label,
      filter_property: createForm.filter_property || 'placeholder_no_filter',
      filter_value: createForm.filter_value ? coerce(createForm.filter_value) : undefined as unknown as string,
      update_data: { [createForm.new_key]: coerce(createForm.new_value) },
    }, { onSuccess: r => setResult(r as Record<string, unknown>) })
  }

  const handleCreateAll = () => {
    // Crear en TODOS los nodos del label sin filtro: usamos un truco con Cypher directo
    // El PATCH /bulk/nodes requiere filter_property, así que usamos una query que siempre coincide
    bulkUpdate.mutate({
      label: createForm.label,
      filter_property: createForm.filter_property || 'placeholder_no_filter',
      filter_value: (createForm.filter_value ? coerce(createForm.filter_value) : null) as string,
      update_data: { [createForm.new_key]: coerce(createForm.new_value) },
    }, { onSuccess: r => setResult(r as Record<string, unknown>) })
  }

  const handleUpdate = () => {
    bulkUpdate.mutate({
      label: updateForm.label,
      filter_property: updateForm.filter_property,
      filter_value: coerce(updateForm.filter_value),
      update_data: { [updateForm.update_key]: coerce(updateForm.update_value) },
    }, { onSuccess: r => setResult(r as Record<string, unknown>) })
  }

  const handleRemove = () => {
    bulkRemove.mutate({
      label: removeForm.label,
      property_to_remove: removeForm.property_to_remove,
      filter_property: removeForm.filter_property || undefined,
      filter_value: removeForm.filter_value ? coerce(removeForm.filter_value) : undefined,
    }, { onSuccess: r => setResult(r as Record<string, unknown>) })
  }

  const input = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 pr-14 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'
  const inputPlain = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'
  const sel = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]'
  const lbl = (t: ReactNode) => <label className="text-xs text-[#8888AA] mb-1 block">{t}</label>

  const MODES = [
    { id: 'create' as Mode, label: '✨ Crear',     cls: 'bg-[#7C6FFF]/15 border-[#7C6FFF] text-[#7C6FFF]' },
    { id: 'update' as Mode, label: '✏️ Actualizar', cls: 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]' },
    { id: 'remove' as Mode, label: '🗑️ Eliminar',   cls: 'bg-[#FF4455]/15 border-[#FF4455] text-[#FF4455]' },
  ]

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-1 font-display">Operaciones Masivas de Propiedades</h3>
        <p className="text-xs text-[#44445A] mb-4">Los valores se convierten al tipo correcto automáticamente.</p>

        <div className="flex gap-2 mb-5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === m.id ? m.cls : 'border-[#252535] text-[#8888AA]'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Crear ── */}
        {mode === 'create' && (
          <div className="space-y-3">
            <p className="text-xs text-[#8888AA]">
              Agrega una nueva propiedad a todos los nodos del label. El filtro es opcional — si lo dejas vacío afecta a todos.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{lbl('Label')}
                <select value={createForm.label} onChange={e => setCreateF({...createForm, label: e.target.value})} className={sel}>
                  {LABELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>{lbl('Nueva Propiedad (key)')}
                <input value={createForm.new_key} onChange={e => setCreateF({...createForm, new_key: e.target.value})}
                  placeholder="nombre del campo" className={inputPlain} />
              </div>
              <div>{lbl(<span>Valor <TypeTagInline v={createForm.new_value} /></span>)}
                <TypedInput value={createForm.new_value} onChange={v => setCreateF({...createForm, new_value: v})}
                  placeholder="valor inicial" className={input} />
              </div>
              <div>{lbl('Filter Property (opcional)')}
                <input value={createForm.filter_property} onChange={e => setCreateF({...createForm, filter_property: e.target.value})}
                  placeholder="campo filtro" className={inputPlain} />
              </div>
              <div>{lbl(<span>Filter Value <TypeTagInline v={createForm.filter_value} /></span>)}
                <TypedInput value={createForm.filter_value} onChange={v => setCreateF({...createForm, filter_value: v})}
                  placeholder="valor filtro" className={input} />
              </div>
            </div>

            {createForm.new_key && (
              <div className="bg-[#090910] rounded-lg p-2.5 font-mono text-xs border border-[#252535] text-[#8888AA]">
                Agregar <span className="text-[#7C6FFF]">{createForm.new_key}</span>
                {' = '}
                <span className="text-[#7C6FFF]">{JSON.stringify(coerce(createForm.new_value))}</span>
                {' a todos los '}
                <span className="text-[#F0F0FF]">{createForm.label}</span>
                {createForm.filter_property && (
                  <> donde <span className="text-[#00E5CC]">{createForm.filter_property}</span>
                    {' = '}<span className="text-[#7C6FFF]">{JSON.stringify(coerce(createForm.filter_value))}</span></>
                )}
              </div>
            )}

            <button onClick={handleCreateAll}
              disabled={bulkUpdate.isPending || !createForm.new_key}
              className="px-5 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium">
              {bulkUpdate.isPending ? 'Procesando...' : '✨ Crear Propiedad en Masa'}
            </button>
          </div>
        )}

        {/* ── Actualizar ── */}
        {mode === 'update' && (
          <div className="space-y-3">
            <p className="text-xs text-[#8888AA]">Actualiza una propiedad existente en todos los nodos que cumplan el filtro.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{lbl('Label')}
                <select value={updateForm.label} onChange={e => setUpdateF({...updateForm, label: e.target.value})} className={sel}>
                  {LABELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>{lbl('Filter Property')}
                <input value={updateForm.filter_property} onChange={e => setUpdateF({...updateForm, filter_property: e.target.value})} placeholder="campo" className={inputPlain} />
              </div>
              <div>{lbl(<span>Filter Value <TypeTagInline v={updateForm.filter_value} /></span>)}
                <TypedInput value={updateForm.filter_value} onChange={v => setUpdateF({...updateForm, filter_value: v})} placeholder="valor" className={input} />
              </div>
              <div>{lbl('Propiedad a actualizar')}
                <input value={updateForm.update_key} onChange={e => setUpdateF({...updateForm, update_key: e.target.value})} placeholder="campo" className={inputPlain} />
              </div>
              <div>{lbl(<span>Nuevo valor <TypeTagInline v={updateForm.update_value} /></span>)}
                <TypedInput value={updateForm.update_value} onChange={v => setUpdateF({...updateForm, update_value: v})} placeholder="valor" className={input} />
              </div>
            </div>
            {updateForm.filter_property && updateForm.update_key && (
              <div className="bg-[#090910] rounded-lg p-2.5 font-mono text-xs border border-[#252535] text-[#8888AA]">
                <span className="text-[#F0F0FF]">{updateForm.label}</span> donde <span className="text-[#00E5CC]">{updateForm.filter_property}</span>
                {' = '}<span className="text-[#7C6FFF]">{JSON.stringify(coerce(updateForm.filter_value))}</span>
                {' → set '}<span className="text-[#00E5CC]">{updateForm.update_key}</span>
                {' = '}<span className="text-[#7C6FFF]">{JSON.stringify(coerce(updateForm.update_value))}</span>
              </div>
            )}
            <button onClick={handleUpdate}
              disabled={bulkUpdate.isPending || !updateForm.filter_property || !updateForm.update_key}
              className="px-5 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg disabled:opacity-50 font-medium">
              {bulkUpdate.isPending ? 'Procesando...' : '✏️ Ejecutar Bulk Update'}
            </button>
          </div>
        )}

        {/* ── Eliminar ── */}
        {mode === 'remove' && (
          <div className="space-y-3">
            <p className="text-xs text-[#8888AA]">Elimina una propiedad de todos los nodos del label (filtro opcional).</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{lbl('Label')}
                <select value={removeForm.label} onChange={e => setRemoveF({...removeForm, label: e.target.value})} className={sel}>
                  {LABELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-span-2">{lbl('Propiedad a eliminar')}
                <input value={removeForm.property_to_remove} onChange={e => setRemoveF({...removeForm, property_to_remove: e.target.value})} placeholder="campo" className={inputPlain} />
              </div>
              <div>{lbl('Filter Property (opcional)')}
                <input value={removeForm.filter_property} onChange={e => setRemoveF({...removeForm, filter_property: e.target.value})} placeholder="campo" className={inputPlain} />
              </div>
              <div>{lbl(<span>Filter Value <TypeTagInline v={removeForm.filter_value} /></span>)}
                <TypedInput value={removeForm.filter_value} onChange={v => setRemoveF({...removeForm, filter_value: v})} placeholder="valor" className={input} />
              </div>
            </div>
            <button onClick={handleRemove}
              disabled={bulkRemove.isPending || !removeForm.property_to_remove}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium">
              {bulkRemove.isPending ? 'Procesando...' : '🗑️ Ejecutar Bulk Remove'}
            </button>
          </div>
        )}
      </div>

      {result && <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5"><JsonViewer data={result} /></div>}
    </div>
  )
}

// Helper inline para el label del tipo dentro de JSX
function TypeTagInline({ v }: { v: string }) {
  const tl = typeLabel(v)
  if (!tl.text) return null
  return <span className={`ml-1 ${tl.color}`}>→ {tl.text}</span>
}

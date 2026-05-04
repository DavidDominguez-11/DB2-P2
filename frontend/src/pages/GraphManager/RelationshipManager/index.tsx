import { useState } from 'react'
import { toast } from 'sonner'
import JsonViewer from '../../../components/common/JsonViewer'
import NodeCard from '../../../components/graph/NodeCard'
import { interactionsApi } from '../../../api/interactions.api'
import { useBulkUpdateInteractions, useBulkDeleteInteractions, useBulkRemoveRelProperty } from '../../../hooks/useInteractions'

function coerce(v: string): unknown {
  if (v.trim() === '') return v
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  const n = Number(v)
  if (!isNaN(n) && v.trim() !== '') return n
  return v
}

function TypeTag({ v }: { v: string }) {
  if (!v.trim()) return null
  const isNum = !isNaN(Number(v)) && v.trim() !== ''
  const isBool = v.toLowerCase() === 'true' || v.toLowerCase() === 'false'
  const label = isBool ? 'bool' : isNum ? 'número' : 'texto'
  const color = isBool ? 'text-[#7C6FFF]' : isNum ? 'text-[#00E5CC]' : 'text-[#8888AA]'
  return <span className={`text-[10px] font-mono ml-1 ${color}`}>→ {label}</span>
}

const REL_TYPES = ['FOLLOWS', 'LISTENED', 'LIKED', 'CONTAINS', 'POSTED', 'BELONGS_TO', 'FEATURED_IN', 'COLLABORATED_WITH', 'CREATED', 'SAVED', 'SHARED']

export default function RelationshipManager() {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')
  const [relId, setRelId] = useState('')
  const [relData, setRelData] = useState<Record<string, unknown> | null>(null)
  const [updateProps, setUpdateProps] = useState('')
  const [removeProps, setRemoveProps] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const [bulkUpdateForm, setBUF] = useState({
    rel_type: 'FOLLOWS', filter_property: '', filter_value: '', update_key: '', update_value: '',
  })
  const [bulkDeleteForm, setBDF] = useState({
    rel_type: 'FOLLOWS', filter_property: '', filter_value: '',
  })
  const [bulkRemoveForm, setBRF] = useState({
    rel_type: 'FOLLOWS', property_to_remove: '',
  })

  const bulkUpdate = useBulkUpdateInteractions()
  const bulkDelete = useBulkDeleteInteractions()
  const bulkRemove = useBulkRemoveRelProperty()

  const fetchRel = async () => {
    if (!relId) return
    setLoading(true)
    try {
      const data = await interactionsApi.get(relId)
      setRelData(data)
    } catch { setRelData(null); toast.error('Relación no encontrada') }
    finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    if (!relId) return
    setLoading(true)
    try {
      let props: Record<string, unknown> = {}
      try { props = JSON.parse(updateProps) } catch { toast.error('JSON inválido'); setLoading(false); return }
      const res = await interactionsApi.update(relId, props)
      setResult(res); toast.success('Relación actualizada')
    } finally { setLoading(false) }
  }

  const handleRemoveProps = async () => {
    if (!relId || !removeProps) return
    setLoading(true)
    try {
      const names = removeProps.split(',').map((p) => p.trim()).filter(Boolean)
      const res = await interactionsApi.removeProperties(relId, names)
      setResult(res); toast.success('Propiedades eliminadas')
    } finally { setLoading(false) }
  }

  const handleDeleteRel = async () => {
    if (!relId) return
    setLoading(true)
    try {
      const res = await interactionsApi.delete(relId)
      setResult(res); setRelData(null); toast.success('Relación eliminada')
    } finally { setLoading(false) }
  }

  const input = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'
  const select = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]'

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-1 mb-2 bg-[#111118] border border-[#252535] rounded-lg p-1 w-fit">
        <button onClick={() => setTab('single')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'single' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}>Individual</button>
        <button onClick={() => setTab('bulk')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'bulk' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}>Masivo</button>
      </div>

      {tab === 'single' ? (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#F0F0FF] font-display">Gestionar Relación Individual</h3>
          <div className="flex gap-2">
            <input value={relId} onChange={(e) => setRelId(e.target.value)} placeholder="ID de la relación" className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
            <button onClick={fetchRel} disabled={loading} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors">Cargar</button>
          </div>

          {relData && <NodeCard node={relData} />}

          <div>
            <label className="text-xs text-[#8888AA] mb-1 block">Actualizar propiedades (JSON)</label>
            <textarea value={updateProps} onChange={(e) => setUpdateProps(e.target.value)} rows={3}
              placeholder='{"notificaciones": true, "plataforma": "mobile"}'
              className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] font-mono placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF] resize-none" />
            <button onClick={handleUpdate} disabled={loading} className="mt-2 px-4 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg disabled:opacity-50 font-medium">
              Actualizar
            </button>
          </div>

          <div>
            <label className="text-xs text-[#8888AA] mb-1 block">Eliminar propiedades (separar por coma)</label>
            <div className="flex gap-2">
              <input value={removeProps} onChange={(e) => setRemoveProps(e.target.value)} placeholder="plataforma, contexto"
                className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#FF4455]" />
              <button onClick={handleRemoveProps} disabled={loading} className="px-4 py-2 bg-[#FF4455]/80 hover:bg-[#FF4455] text-white text-sm rounded-lg disabled:opacity-50">Eliminar</button>
            </div>
          </div>

          <button onClick={handleDeleteRel} disabled={loading || !relId} className="px-4 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium">
            🗑️ Eliminar Relación
          </button>
        </div>
      ) : (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[#F0F0FF] font-display">Operaciones Masivas</h3>
            <p className="text-xs text-[#44445A] mt-1">Los valores se convierten automáticamente al tipo correcto (número, bool, texto).</p>
          </div>

          {/* Bulk Update */}
          <div className="border border-[#252535] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-[#00E5CC] uppercase tracking-wider">Bulk Update</p>
            <p className="text-xs text-[#8888AA]">Actualiza una propiedad en todas las relaciones que cumplan el filtro</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-[#8888AA] mb-1 block">Tipo de Relación</label>
                <select value={bulkUpdateForm.rel_type} onChange={(e) => setBUF({...bulkUpdateForm, rel_type: e.target.value})} className={select}>
                  {REL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property</label>
                <input value={bulkUpdateForm.filter_property} onChange={(e) => setBUF({...bulkUpdateForm, filter_property: e.target.value})} placeholder="ej: plataforma" className={input} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value <TypeTag v={bulkUpdateForm.filter_value} />
                </label>
                <input value={bulkUpdateForm.filter_value} onChange={(e) => setBUF({...bulkUpdateForm, filter_value: e.target.value})} placeholder="ej: web" className={input} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Update Key</label>
                <input value={bulkUpdateForm.update_key} onChange={(e) => setBUF({...bulkUpdateForm, update_key: e.target.value})} placeholder="propiedad a actualizar" className={input} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Update Value <TypeTag v={bulkUpdateForm.update_value} />
                </label>
                <input value={bulkUpdateForm.update_value} onChange={(e) => setBUF({...bulkUpdateForm, update_value: e.target.value})} placeholder="nuevo valor" className={input} />
              </div>
            </div>

            {bulkUpdateForm.filter_property && bulkUpdateForm.update_key && (
              <div className="bg-[#090910] rounded-lg p-2.5 font-mono text-xs text-[#8888AA] border border-[#252535]">
                <span className="text-[#F0F0FF]">{bulkUpdateForm.rel_type}</span>
                {' '}donde{' '}
                <span className="text-[#00E5CC]">{bulkUpdateForm.filter_property}</span>
                {' = '}
                <span className="text-[#7C6FFF]">{JSON.stringify(coerce(bulkUpdateForm.filter_value))}</span>
                {' → set '}
                <span className="text-[#00E5CC]">{bulkUpdateForm.update_key}</span>
                {' = '}
                <span className="text-[#7C6FFF]">{JSON.stringify(coerce(bulkUpdateForm.update_value))}</span>
              </div>
            )}

            <button
              onClick={() => bulkUpdate.mutate({
                rel_type: bulkUpdateForm.rel_type,
                filter_property: bulkUpdateForm.filter_property,
                filter_value: coerce(bulkUpdateForm.filter_value),
                update_data: { [bulkUpdateForm.update_key]: coerce(bulkUpdateForm.update_value) },
              }, { onSuccess: (r) => setResult(r as Record<string, unknown>) })}
              disabled={bulkUpdate.isPending || !bulkUpdateForm.filter_property || !bulkUpdateForm.update_key}
              className="px-4 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkUpdate.isPending ? 'Procesando...' : 'Ejecutar Bulk Update'}
            </button>
          </div>

          {/* Bulk Delete */}
          <div className="border border-[#252535] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-[#FF4455] uppercase tracking-wider">Bulk Delete</p>
            <p className="text-xs text-[#8888AA]">Elimina todas las relaciones que cumplan el filtro</p>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Tipo de Relación</label>
                <select value={bulkDeleteForm.rel_type} onChange={(e) => setBDF({...bulkDeleteForm, rel_type: e.target.value})} className={select}>
                  {REL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property</label>
                <input value={bulkDeleteForm.filter_property} onChange={(e) => setBDF({...bulkDeleteForm, filter_property: e.target.value})} placeholder="ej: plataforma" className={input} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value <TypeTag v={bulkDeleteForm.filter_value} />
                </label>
                <input value={bulkDeleteForm.filter_value} onChange={(e) => setBDF({...bulkDeleteForm, filter_value: e.target.value})} placeholder="ej: web" className={input} />
              </div>
            </div>

            <button
              onClick={() => bulkDelete.mutate({
                rel_type: bulkDeleteForm.rel_type,
                filter_property: bulkDeleteForm.filter_property,
                filter_value: coerce(bulkDeleteForm.filter_value),
              }, { onSuccess: (r) => setResult(r as Record<string, unknown>) })}
              disabled={bulkDelete.isPending || !bulkDeleteForm.filter_property || !bulkDeleteForm.filter_value}
              className="px-4 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkDelete.isPending ? 'Procesando...' : 'Ejecutar Bulk Delete'}
            </button>
          </div>

          {/* Bulk Remove Property */}
          <div className="border border-[#252535] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-[#7C6FFF] uppercase tracking-wider">Bulk Remove Property</p>
            <p className="text-xs text-[#8888AA]">Elimina una propiedad de todas las relaciones del tipo indicado</p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Tipo de Relación</label>
                <select value={bulkRemoveForm.rel_type} onChange={(e) => setBRF({...bulkRemoveForm, rel_type: e.target.value})} className={select}>
                  {REL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Property to Remove</label>
                <input value={bulkRemoveForm.property_to_remove} onChange={(e) => setBRF({...bulkRemoveForm, property_to_remove: e.target.value})} placeholder="ej: plataforma" className={input} />
              </div>
            </div>

            <button
              onClick={() => bulkRemove.mutate({
                rel_type: bulkRemoveForm.rel_type,
                property_to_remove: bulkRemoveForm.property_to_remove,
              }, { onSuccess: (r) => setResult(r as Record<string, unknown>) })}
              disabled={bulkRemove.isPending || !bulkRemoveForm.property_to_remove}
              className="px-4 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkRemove.isPending ? 'Procesando...' : 'Ejecutar Bulk Remove Property'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <p className="text-xs text-[#8888AA] mb-2">Resultado</p>
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

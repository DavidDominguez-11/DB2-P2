import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import { usersApi } from '../../../api/users.api'
import { songsApi } from '../../../api/songs.api'
import { playlistsApi } from '../../../api/playlists.api'
import { postsApi } from '../../../api/posts.api'
import { genresApi } from '../../../api/genres.api'
import { interactionsApi } from '../../../api/interactions.api'
import { useBulkDeleteNodes } from '../../../hooks/useBulk'
import { useBulkDeleteInteractions } from '../../../hooks/useInteractions'

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

const APIS = { users: usersApi, songs: songsApi, playlists: playlistsApi, posts: postsApi, genres: genresApi }
type EntityType = keyof typeof APIS

const LABEL_MAP: Record<EntityType, string> = {
  users: 'User', songs: 'Song', playlists: 'Playlist', posts: 'Post', genres: 'Genre',
}

const REL_TYPES = ['FOLLOWS', 'LISTENED', 'LIKED', 'CONTAINS', 'POSTED', 'BELONGS_TO', 'FEATURED_IN', 'COLLABORATED_WITH', 'CREATED', 'SAVED', 'SHARED']

const SECTIONS = [
  { id: 'node-single', label: '🔴 Nodo Individual' },
  { id: 'node-bulk',   label: '🔴 Nodos Masivo' },
  { id: 'rel-single',  label: '🔴 Relación Individual' },
  { id: 'rel-bulk',    label: '🔴 Relaciones Masivo' },
] as const

export default function DeletePanel() {
  const [section, setSection] = useState<typeof SECTIONS[number]['id']>('node-single')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [confirmMsg, setConfirmMsg] = useState('')

  const [entity, setEntity] = useState<EntityType>('users')
  const [nodeId, setNodeId] = useState('')
  const [relId, setRelId] = useState('')

  const [bulkLabel, setBulkLabel] = useState('User')
  const [bulkFilter, setBulkFilter] = useState('')
  const [bulkValue, setBulkValue] = useState('')

  const [bulkRelType, setBulkRelType] = useState('FOLLOWS')
  const [bulkRelFilter, setBulkRelFilter] = useState('')
  const [bulkRelValue, setBulkRelValue] = useState('')

  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const bulkDeleteNodes = useBulkDeleteNodes()
  const bulkDeleteRels = useBulkDeleteInteractions()

  const confirm = (msg: string, action: () => void) => {
    setConfirmMsg(msg)
    setPendingAction(() => action)
    setConfirmOpen(true)
  }

  const executeConfirmed = () => {
    if (pendingAction) pendingAction()
    setConfirmOpen(false)
  }

  const deleteNode = async () => {
    setLoading(true)
    try {
      await APIS[entity].delete(nodeId)
      toast.success(`Nodo eliminado`)
      setLastResult(`Nodo ${entity.slice(0, -1)} ID "${nodeId}" eliminado`)
      setNodeId('')
    } catch { } finally { setLoading(false) }
  }

  const deleteRel = async () => {
    setLoading(true)
    try {
      await interactionsApi.delete(relId)
      toast.success(`Relación eliminada`)
      setLastResult(`Relación ID "${relId}" eliminada`)
      setRelId('')
    } catch { } finally { setLoading(false) }
  }

  const inputCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#FF4455]'
  const selectCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#FF4455]'

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-[#FF4455]/10 border border-[#FF4455]/30 rounded-xl p-4">
        <p className="text-sm font-bold text-[#FF4455]">⚠️ Panel de Eliminación</p>
        <p className="text-xs text-[#8888AA] mt-1">Las operaciones aquí son irreversibles. Se requiere confirmación explícita.</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setSection(id); setLastResult(null) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              section === id
                ? 'bg-[#FF4455]/20 border-[#FF4455] text-[#FF4455]'
                : 'border-[#252535] text-[#8888AA] hover:border-[#FF4455]/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#16161F] border border-[#FF4455]/20 rounded-xl p-5 space-y-4">

        {/* ── Nodo Individual ── */}
        {section === 'node-single' && (
          <>
            <h3 className="text-sm font-semibold text-[#FF4455] font-display">Eliminar Nodo Individual</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(APIS) as EntityType[]).map((e) => (
                <button key={e} onClick={() => setEntity(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs border capitalize transition-colors ${entity === e ? 'bg-[#FF4455]/20 border-[#FF4455] text-[#FF4455]' : 'border-[#252535] text-[#8888AA] hover:border-[#FF4455]/50'}`}>
                  {e}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">ID del nodo</label>
              <input value={nodeId} onChange={(e) => setNodeId(e.target.value)}
                placeholder={`ej: 42`} className={inputCls} />
            </div>
            <button
              onClick={() => confirm(
                `¿Eliminar ${entity.slice(0,-1)} con ID "${nodeId}"? Esta acción no se puede deshacer.`,
                deleteNode
              )}
              disabled={!nodeId || loading}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              🗑️ Eliminar Nodo
            </button>
          </>
        )}

        {/* ── Nodos Masivo ── */}
        {section === 'node-bulk' && (
          <>
            <h3 className="text-sm font-semibold text-[#FF4455] font-display">Eliminar Nodos Masivamente</h3>
            <p className="text-xs text-[#8888AA]">Elimina todos los nodos del label que cumplan el filtro.</p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Label</label>
                <select value={bulkLabel} onChange={(e) => setBulkLabel(e.target.value)} className={selectCls}>
                  {['User','Song','Playlist','Post','Genre'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property</label>
                <input value={bulkFilter} onChange={(e) => setBulkFilter(e.target.value)}
                  placeholder="ej: is_ad" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value <TypeTag v={bulkValue} />
                </label>
                <input value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}
                  placeholder="ej: true" className={inputCls} />
              </div>
            </div>

            {/* Preview del filtro */}
            {bulkFilter && bulkValue && (
              <div className="bg-[#090910] rounded-lg p-2.5 font-mono text-xs border border-[#FF4455]/20 text-[#8888AA]">
                Se eliminarán todos los nodos{' '}
                <span className="text-[#FF4455]">{bulkLabel}</span>
                {' '}donde{' '}
                <span className="text-[#00E5CC]">{bulkFilter}</span>
                {' = '}
                <span className="text-[#7C6FFF]">{JSON.stringify(coerce(bulkValue))}</span>
              </div>
            )}

            <button
              onClick={() => confirm(
                `¿Eliminar todos los nodos ${bulkLabel} donde ${bulkFilter} = ${JSON.stringify(coerce(bulkValue))}? Esta acción NO se puede deshacer.`,
                () => bulkDeleteNodes.mutate(
                  { label: bulkLabel, filter_property: bulkFilter, filter_value: coerce(bulkValue) },
                  { onSuccess: (r) => setLastResult(`${r.affected ?? 0} nodos ${bulkLabel} eliminados`) }
                )
              )}
              disabled={!bulkFilter || !bulkValue || bulkDeleteNodes.isPending}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkDeleteNodes.isPending ? 'Eliminando...' : '🗑️ Eliminar Nodos en Masa'}
            </button>
          </>
        )}

        {/* ── Relación Individual ── */}
        {section === 'rel-single' && (
          <>
            <h3 className="text-sm font-semibold text-[#FF4455] font-display">Eliminar Relación Individual</h3>
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">ID de la relación</label>
              <input value={relId} onChange={(e) => setRelId(e.target.value)}
                placeholder="element_id de la relación" className={inputCls} />
            </div>
            <button
              onClick={() => confirm(
                `¿Eliminar la relación con ID "${relId}"?`,
                deleteRel
              )}
              disabled={!relId || loading}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              🗑️ Eliminar Relación
            </button>
          </>
        )}

        {/* ── Relaciones Masivo ── */}
        {section === 'rel-bulk' && (
          <>
            <h3 className="text-sm font-semibold text-[#FF4455] font-display">Eliminar Relaciones Masivamente</h3>
            <p className="text-xs text-[#8888AA]">Elimina todas las relaciones del tipo indicado que cumplan el filtro.</p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Tipo Relación</label>
                <select value={bulkRelType} onChange={(e) => setBulkRelType(e.target.value)} className={selectCls}>
                  {REL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Filter Property</label>
                <input value={bulkRelFilter} onChange={(e) => setBulkRelFilter(e.target.value)}
                  placeholder="ej: plataforma" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">
                  Filter Value <TypeTag v={bulkRelValue} />
                </label>
                <input value={bulkRelValue} onChange={(e) => setBulkRelValue(e.target.value)}
                  placeholder="ej: web" className={inputCls} />
              </div>
            </div>

            {bulkRelFilter && bulkRelValue && (
              <div className="bg-[#090910] rounded-lg p-2.5 font-mono text-xs border border-[#FF4455]/20 text-[#8888AA]">
                Se eliminarán todas las relaciones{' '}
                <span className="text-[#FF4455]">{bulkRelType}</span>
                {' '}donde{' '}
                <span className="text-[#00E5CC]">{bulkRelFilter}</span>
                {' = '}
                <span className="text-[#7C6FFF]">{JSON.stringify(coerce(bulkRelValue))}</span>
              </div>
            )}

            <button
              onClick={() => confirm(
                `¿Eliminar todas las relaciones ${bulkRelType} donde ${bulkRelFilter} = ${JSON.stringify(coerce(bulkRelValue))}?`,
                () => bulkDeleteRels.mutate(
                  { rel_type: bulkRelType, filter_property: bulkRelFilter, filter_value: coerce(bulkRelValue) },
                  { onSuccess: (r) => setLastResult(`${r.affected ?? 0} relaciones ${bulkRelType} eliminadas`) }
                )
              )}
              disabled={!bulkRelFilter || !bulkRelValue || bulkDeleteRels.isPending}
              className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 font-medium"
            >
              {bulkDeleteRels.isPending ? 'Eliminando...' : '🗑️ Eliminar Relaciones en Masa'}
            </button>
          </>
        )}
      </div>

      {/* Resultado de última operación */}
      {lastResult && (
        <div className="bg-[#22D3A0]/10 border border-[#22D3A0]/30 rounded-xl p-4 text-sm text-[#22D3A0] font-medium">
          ✓ {lastResult}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeConfirmed}
        title="Confirmar Eliminación"
        message={confirmMsg}
        danger
      />
    </div>
  )
}

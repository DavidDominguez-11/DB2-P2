import { useState } from 'react'
import { toast } from 'sonner'
import { usersApi } from '../../../api/users.api'
import { songsApi } from '../../../api/songs.api'
import { playlistsApi } from '../../../api/playlists.api'
import { postsApi } from '../../../api/posts.api'
import { genresApi } from '../../../api/genres.api'
import JsonViewer from '../../../components/common/JsonViewer'

type EntityType = 'users' | 'songs' | 'playlists' | 'posts' | 'genres'
type Mode = 'create' | 'update' | 'remove'

const APIS = { users: usersApi, songs: songsApi, playlists: playlistsApi, posts: postsApi, genres: genresApi }

function coerce(v: string): unknown {
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  const n = Number(v)
  if (!isNaN(n) && v.trim() !== '') return n
  return v
}

export default function SinglePropertyOps() {
  const [entity, setEntity] = useState<EntityType>('users')
  const [mode, setMode] = useState<Mode>('create')
  const [nodeId, setNodeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  // Modo Crear — múltiples pares key/value
  const [newProps, setNewProps] = useState([{ key: '', value: '' }])
  const addProp = () => setNewProps([...newProps, { key: '', value: '' }])
  const removeProp = (i: number) => setNewProps(newProps.filter((_, idx) => idx !== i))
  const setProp = (i: number, field: 'key' | 'value', val: string) =>
    setNewProps(newProps.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  // Modo Actualizar — una propiedad a la vez
  const [propKey, setPropKey] = useState('')
  const [propValue, setPropValue] = useState('')

  // Modo Eliminar — varias propiedades separadas por coma
  const [removeProps, setRemoveProps] = useState('')

  const handleCreate = async () => {
    if (!nodeId) return
    const valid = newProps.filter(p => p.key.trim())
    if (!valid.length) { toast.error('Agrega al menos una propiedad'); return }
    setLoading(true)
    try {
      const data = Object.fromEntries(valid.map(p => [p.key.trim(), coerce(p.value)]))
      const res = await APIS[entity].update(nodeId, data)
      setResult(res); toast.success(`${valid.length} propiedad${valid.length > 1 ? 'es' : ''} creada${valid.length > 1 ? 's' : ''}`)
    } finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    if (!nodeId || !propKey) return
    setLoading(true)
    try {
      const res = await APIS[entity].update(nodeId, { [propKey]: coerce(propValue) })
      setResult(res); toast.success('Propiedad actualizada')
    } finally { setLoading(false) }
  }

  const handleRemove = async () => {
    if (!nodeId || !removeProps) return
    setLoading(true)
    try {
      const props = removeProps.split(',').map(p => p.trim()).filter(Boolean)
      const res = await APIS[entity].removeProperties(nodeId, props)
      setResult(res); toast.success('Propiedades eliminadas')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'

  const MODES: { id: Mode; label: string; color: string; active: string }[] = [
    { id: 'create', label: 'Crear',     color: 'text-[#7C6FFF]', active: 'bg-[#7C6FFF]/15 border-[#7C6FFF]'  },
    { id: 'update', label: 'Actualizar',color: 'text-[#00E5CC]', active: 'bg-[#00E5CC]/15 border-[#00E5CC]'  },
    { id: 'remove', label: 'Eliminar',  color: 'text-[#FF4455]', active: 'bg-[#FF4455]/15 border-[#FF4455]'  },
  ]

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Operaciones Individuales</h3>

        {/* Selector de entidad */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['users','songs','playlists','posts','genres'] as EntityType[]).map(e => (
            <button key={e} onClick={() => setEntity(e)}
              className={`px-3 py-1.5 rounded-lg text-xs border capitalize transition-all ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}>
              {e}
            </button>
          ))}
        </div>

        {/* Selector de modo */}
        <div className="flex gap-2 mb-4">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === m.id ? `${m.active} ${m.color}` : 'border-[#252535] text-[#8888AA]'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* ID siempre visible */}
          <div>
            <label className="text-xs text-[#8888AA] mb-1 block">ID del nodo *</label>
            <input value={nodeId} onChange={e => setNodeId(e.target.value)}
              placeholder="ID del nodo" className={inputCls} />
          </div>

          {/* ── Crear ── */}
          {mode === 'create' && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#8888AA]">Nuevas propiedades</label>
                <button type="button" onClick={addProp}
                  className="text-xs text-[#7C6FFF] hover:text-violet-400 transition-colors">
                  + Agregar campo
                </button>
              </div>
              <div className="space-y-2">
                {newProps.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={p.key} onChange={e => setProp(i, 'key', e.target.value)}
                      placeholder="nombre de propiedad" className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
                    <input value={p.value} onChange={e => setProp(i, 'value', e.target.value)}
                      placeholder="valor" className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
                    {newProps.length > 1 && (
                      <button onClick={() => removeProp(i)} className="text-[#FF4455] hover:text-red-400 text-lg leading-none w-5 text-center">×</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#44445A]">
                Los valores numéricos y booleanos se convierten automáticamente.
              </p>
              <button onClick={handleCreate} disabled={loading || !nodeId}
                className="px-5 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {loading ? 'Creando...' : '✨ Crear Propiedades'}
              </button>
            </>
          )}

          {/* ── Actualizar ── */}
          {mode === 'update' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8888AA] mb-1 block">Propiedad existente</label>
                  <input value={propKey} onChange={e => setPropKey(e.target.value)}
                    placeholder="campo" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-[#8888AA] mb-1 block">Nuevo valor</label>
                  <input value={propValue} onChange={e => setPropValue(e.target.value)}
                    placeholder="valor" className={inputCls} />
                </div>
              </div>
              <button onClick={handleUpdate} disabled={loading || !nodeId || !propKey}
                className="px-5 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {loading ? 'Actualizando...' : '✏️ Actualizar Propiedad'}
              </button>
            </>
          )}

          {/* ── Eliminar ── */}
          {mode === 'remove' && (
            <>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Propiedades a eliminar (separadas por coma)</label>
                <input value={removeProps} onChange={e => setRemoveProps(e.target.value)}
                  placeholder="campo1, campo2" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#FF4455]" />
              </div>
              <button onClick={handleRemove} disabled={loading || !nodeId || !removeProps}
                className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {loading ? 'Eliminando...' : '🗑️ Eliminar Propiedades'}
              </button>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  )
}

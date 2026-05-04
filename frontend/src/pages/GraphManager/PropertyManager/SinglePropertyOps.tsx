import { useState } from 'react'
import { toast } from 'sonner'
import { usersApi } from '../../../api/users.api'
import { songsApi } from '../../../api/songs.api'
import { playlistsApi } from '../../../api/playlists.api'
import { postsApi } from '../../../api/posts.api'
import { genresApi } from '../../../api/genres.api'
import JsonViewer from '../../../components/common/JsonViewer'

type EntityType = 'users' | 'songs' | 'playlists' | 'posts' | 'genres'
type Mode = 'update' | 'remove'

const APIS = { users: usersApi, songs: songsApi, playlists: playlistsApi, posts: postsApi, genres: genresApi }

export default function SinglePropertyOps() {
  const [entity, setEntity] = useState<EntityType>('users')
  const [mode, setMode] = useState<Mode>('update')
  const [nodeId, setNodeId] = useState('')
  const [propKey, setPropKey] = useState('')
  const [propValue, setPropValue] = useState('')
  const [removeProps, setRemoveProps] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const handleUpdate = async () => {
    if (!nodeId || !propKey) return
    setLoading(true)
    try {
      const res = await APIS[entity].update(nodeId, { [propKey]: propValue })
      setResult(res); toast.success('Propiedad actualizada')
    } finally { setLoading(false) }
  }

  const handleRemove = async () => {
    if (!nodeId || !removeProps) return
    setLoading(true)
    try {
      const props = removeProps.split(',').map((p) => p.trim()).filter(Boolean)
      const res = await APIS[entity].removeProperties(nodeId, props)
      setResult(res); toast.success('Propiedades eliminadas')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0FF] mb-4 font-display">Operaciones Individuales</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['users','songs','playlists','posts','genres'] as EntityType[]).map((e) => (
            <button key={e} onClick={() => setEntity(e)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}>{e}</button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('update')} className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === 'update' ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]' : 'border-[#252535] text-[#8888AA]'}`}>Actualizar</button>
          <button onClick={() => setMode('remove')} className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${mode === 'remove' ? 'bg-[#FF4455]/15 border-[#FF4455] text-[#FF4455]' : 'border-[#252535] text-[#8888AA]'}`}>Eliminar</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#8888AA] mb-1 block">ID del nodo *</label>
            <input value={nodeId} onChange={(e) => setNodeId(e.target.value)} placeholder="ID del nodo" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
          </div>

          {mode === 'update' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8888AA] mb-1 block">Propiedad</label>
                  <input value={propKey} onChange={(e) => setPropKey(e.target.value)} placeholder="campo" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
                </div>
                <div>
                  <label className="text-xs text-[#8888AA] mb-1 block">Nuevo Valor</label>
                  <input value={propValue} onChange={(e) => setPropValue(e.target.value)} placeholder="valor" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
                </div>
              </div>
              <button onClick={handleUpdate} disabled={loading} className="px-5 py-2 bg-[#00E5CC] hover:bg-teal-400 text-black text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {loading ? 'Actualizando...' : 'Actualizar Propiedad'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-[#8888AA] mb-1 block">Propiedades a eliminar (separadas por coma)</label>
                <input value={removeProps} onChange={(e) => setRemoveProps(e.target.value)} placeholder="campo1, campo2" className="w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#FF4455]" />
              </div>
              <button onClick={handleRemove} disabled={loading} className="px-5 py-2 bg-[#FF4455] hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium">
                {loading ? 'Eliminando...' : 'Eliminar Propiedades'}
              </button>
            </>
          )}
        </div>
      </div>

      {result && <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5"><JsonViewer data={result} /></div>}
    </div>
  )
}

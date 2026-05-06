import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DataTable from '../../../components/common/DataTable'
import { nodesApi, type FilterCondition } from '../../../api/nodes.api'

type EntityLabel = 'User' | 'Song' | 'Playlist' | 'Post' | 'Genre'

// ── Filtros fijos por entidad ────────────────────────────────────────────────

interface UserFilters   { user_id: string; username: string; email: string; premium: string }
interface SongFilters   { song_id: string; titulo: string; pop_min: string; pop_max: string }
interface PlaylistFilters { playlist_id: string; nombre: string; publica: string }
interface PostFilters   { post_id: string; caption: string; tipo: string; privacidad: string }
interface GenreFilters  { genre_id: string; nombre: string; pop_min: string }

const EMPTY_USER:     UserFilters     = { user_id: '', username: '', email: '', premium: '' }
const EMPTY_SONG:     SongFilters     = { song_id: '', titulo: '', pop_min: '', pop_max: '' }
const EMPTY_PLAYLIST: PlaylistFilters = { playlist_id: '', nombre: '', publica: '' }
const EMPTY_POST:     PostFilters     = { post_id: '', caption: '', tipo: '', privacidad: '' }
const EMPTY_GENRE:    GenreFilters    = { genre_id: '', nombre: '', pop_min: '' }

function buildFilters(entity: EntityLabel, f: Record<string, string>): FilterCondition[] {
  const out: FilterCondition[] = []
  const add = (field: string, op: string, value: string) => {
    if (value !== '') out.push({ field, op, value })
  }
  if (entity === 'User') {
    add('user_id',  'eq',       f.user_id)
    add('username', 'contains', f.username)
    add('email',    'contains', f.email)
    if (f.premium !== '') add('premium', 'eq', f.premium)
  }
  if (entity === 'Song') {
    add('song_id',     'eq',       f.song_id)
    add('titulo',      'contains', f.titulo)
    add('popularidad', 'gte',      f.pop_min)
    add('popularidad', 'lte',      f.pop_max)
  }
  if (entity === 'Playlist') {
    add('playlist_id', 'eq',       f.playlist_id)
    add('nombre',      'contains', f.nombre)
    if (f.publica !== '') add('publica', 'eq', f.publica)
  }
  if (entity === 'Post') {
    add('post_id',   'eq',       f.post_id)
    add('caption',   'contains', f.caption)
    add('tipo',      'eq',       f.tipo)
    add('privacidad','eq',       f.privacidad)
  }
  if (entity === 'Genre') {
    add('genre_id',    'eq',       f.genre_id)
    add('nombre',      'contains', f.nombre)
    add('popularidad', 'gte',      f.pop_min)
  }
  return out
}

// ── Componentes de filtro por entidad ────────────────────────────────────────

const inputCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-1.5 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]'
const selectCls = 'w-full bg-[#090910] border border-[#252535] rounded-lg px-3 py-1.5 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#7C6FFF]'
const lbl = (text: string) => <label className="text-xs text-[#8888AA] mb-1 block">{text}</label>

function UserFilterForm({ f, set }: { f: UserFilters; set: (v: UserFilters) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>{lbl('User ID')}
        <input value={f.user_id}  onChange={e => set({...f, user_id: e.target.value})}  placeholder="exacto" className={inputCls} />
      </div>
      <div>{lbl('Username contiene')}
        <input value={f.username} onChange={e => set({...f, username: e.target.value})} placeholder="ej: john" className={inputCls} />
      </div>
      <div>{lbl('Email contiene')}
        <input value={f.email}    onChange={e => set({...f, email: e.target.value})}    placeholder="ej: @gmail" className={inputCls} />
      </div>
      <div>{lbl('Premium')}
        <select value={f.premium} onChange={e => set({...f, premium: e.target.value})} className={selectCls}>
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  )
}

function SongFilterForm({ f, set }: { f: SongFilters; set: (v: SongFilters) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>{lbl('Song ID')}
        <input value={f.song_id} onChange={e => set({...f, song_id: e.target.value})} placeholder="exacto" className={inputCls} />
      </div>
      <div>{lbl('Título contiene')}
        <input value={f.titulo}  onChange={e => set({...f, titulo: e.target.value})}  placeholder="ej: love" className={inputCls} />
      </div>
      <div>{lbl('Popularidad mínima')}
        <input type="number" value={f.pop_min} onChange={e => set({...f, pop_min: e.target.value})} placeholder="ej: 50" className={inputCls} />
      </div>
      <div>{lbl('Popularidad máxima')}
        <input type="number" value={f.pop_max} onChange={e => set({...f, pop_max: e.target.value})} placeholder="ej: 100" className={inputCls} />
      </div>
    </div>
  )
}

function PlaylistFilterForm({ f, set }: { f: PlaylistFilters; set: (v: PlaylistFilters) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>{lbl('Playlist ID')}
        <input value={f.playlist_id} onChange={e => set({...f, playlist_id: e.target.value})} placeholder="exacto" className={inputCls} />
      </div>
      <div>{lbl('Nombre contiene')}
        <input value={f.nombre} onChange={e => set({...f, nombre: e.target.value})} placeholder="ej: rock" className={inputCls} />
      </div>
      <div>{lbl('Pública')}
        <select value={f.publica} onChange={e => set({...f, publica: e.target.value})} className={selectCls}>
          <option value="">Todas</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  )
}

function PostFilterForm({ f, set }: { f: PostFilters; set: (v: PostFilters) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>{lbl('Post ID')}
        <input value={f.post_id} onChange={e => set({...f, post_id: e.target.value})} placeholder="exacto" className={inputCls} />
      </div>
      <div>{lbl('Caption contiene')}
        <input value={f.caption} onChange={e => set({...f, caption: e.target.value})} placeholder="ej: música" className={inputCls} />
      </div>
      <div>{lbl('Tipo')}
        <select value={f.tipo} onChange={e => set({...f, tipo: e.target.value})} className={selectCls}>
          <option value="">Todos</option>
          <option value="song">Song</option>
          <option value="playlist">Playlist</option>
          <option value="update">Update</option>
          <option value="event">Event</option>
        </select>
      </div>
      <div>{lbl('Privacidad')}
        <select value={f.privacidad} onChange={e => set({...f, privacidad: e.target.value})} className={selectCls}>
          <option value="">Todas</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="friends">Friends</option>
        </select>
      </div>
    </div>
  )
}

function GenreFilterForm({ f, set }: { f: GenreFilters; set: (v: GenreFilters) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>{lbl('Genre ID')}
        <input value={f.genre_id} onChange={e => set({...f, genre_id: e.target.value})} placeholder="exacto" className={inputCls} />
      </div>
      <div>{lbl('Nombre contiene')}
        <input value={f.nombre} onChange={e => set({...f, nombre: e.target.value})} placeholder="ej: rock" className={inputCls} />
      </div>
      <div>{lbl('Popularidad mínima')}
        <input type="number" value={f.pop_min} onChange={e => set({...f, pop_min: e.target.value})} placeholder="ej: 50" className={inputCls} />
      </div>
    </div>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────

export default function NodeListPanel() {
  const [entity, setEntity] = useState<EntityLabel>('User')
  const [limit, setLimit] = useState(25)
  const [skip, setSkip] = useState(0)
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([])
  const [submitted, setSubmitted] = useState(true)

  const [uF, setUF] = useState<UserFilters>(EMPTY_USER)
  const [sF, setSF] = useState<SongFilters>(EMPTY_SONG)
  const [plF, setPlF] = useState<PlaylistFilters>(EMPTY_PLAYLIST)
  const [poF, setPoF] = useState<PostFilters>(EMPTY_POST)
  const [gF, setGF] = useState<GenreFilters>(EMPTY_GENRE)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['node-search', entity, appliedFilters, skip, limit],
    queryFn: () => nodesApi.search(entity, appliedFilters, skip, limit),
    enabled: submitted,
  })

  const nodes: Record<string, unknown>[] = data?.nodes ?? []

  const apply = () => {
    const rawFilters: Record<string, string> =
      entity === 'User'     ? uF  :
      entity === 'Song'     ? sF  :
      entity === 'Playlist' ? plF :
      entity === 'Post'     ? poF : gF

    setAppliedFilters(buildFilters(entity, rawFilters as Record<string, string>))
    setSkip(0)
    setSubmitted(true)
  }

  const clear = () => {
    setUF(EMPTY_USER); setSF(EMPTY_SONG); setPlF(EMPTY_PLAYLIST)
    setPoF(EMPTY_POST); setGF(EMPTY_GENRE)
    setAppliedFilters([])
    setSkip(0)
    setSubmitted(true)
  }

  const changeEntity = (e: EntityLabel) => {
    setEntity(e)
    setAppliedFilters([])
    setSkip(0)
    setSubmitted(true)
  }

  const cols = nodes.length > 0
    ? Object.keys(nodes[0])
        .filter(k => !['labels', 'connections', '_labels', '_element_id'].includes(k))
        .slice(0, 7)
        .map(k => ({
          key: k,
          header: k,
          sortable: true,
          render: (r: Record<string, unknown>) => {
            const v = r[k]
            if (Array.isArray(v)) return v.join(', ')
            if (typeof v === 'boolean') return v ? '✓' : '✗'
            return String(v ?? '—')
          },
        }))
    : [{ key: 'id', header: 'ID', sortable: false }]

  return (
    <div className="space-y-4">
      {/* Selector de entidad + límite */}
      <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {(['User','Song','Playlist','Post','Genre'] as EntityLabel[]).map(e => (
              <button key={e} onClick={() => changeEntity(e)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${entity === e ? 'bg-[#7C6FFF] border-[#7C6FFF] text-white' : 'border-[#252535] text-[#8888AA] hover:border-[#7C6FFF]/50'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-[#8888AA]">Límite:</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}
              className="bg-[#090910] border border-[#252535] rounded px-2 py-1 text-sm text-[#F0F0FF] focus:outline-none">
              {[10, 25, 50, 100].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Filtros fijos según entidad */}
        {entity === 'User'     && <UserFilterForm     f={uF}  set={setUF}  />}
        {entity === 'Song'     && <SongFilterForm     f={sF}  set={setSF}  />}
        {entity === 'Playlist' && <PlaylistFilterForm f={plF} set={setPlF} />}
        {entity === 'Post'     && <PostFilterForm     f={poF} set={setPoF} />}
        {entity === 'Genre'    && <GenreFilterForm    f={gF}  set={setGF}  />}

        <div className="flex gap-2 mt-4">
          <button onClick={apply}
            className="px-5 py-2 bg-[#7C6FFF] hover:bg-violet-500 text-white text-sm rounded-lg transition-colors font-medium">
            {isFetching ? 'Buscando...' : '🔍 Aplicar filtros'}
          </button>
          {appliedFilters.length > 0 && (
            <button onClick={clear}
              className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors">
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Resumen de filtros activos */}
        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {appliedFilters.map((f, i) => (
              <span key={i} className="text-xs bg-[#7C6FFF]/15 border border-[#7C6FFF]/30 text-[#7C6FFF] px-2 py-0.5 rounded-full font-mono">
                {f.field} {f.op} "{f.value}"
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabla de resultados */}
      <DataTable data={nodes} columns={cols} loading={isLoading || isFetching}
        keyField="element_id" pageSize={limit} />

      {/* Paginación */}
      <div className="flex gap-3 items-center">
        <button disabled={skip === 0} onClick={() => { setSkip(Math.max(0, skip - limit)); setSubmitted(true) }}
          className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <span className="text-sm text-[#44445A]">
          {skip + 1}–{skip + nodes.length}
          {appliedFilters.length > 0 && ` · ${appliedFilters.length} filtro${appliedFilters.length > 1 ? 's' : ''}`}
        </span>
        <button disabled={nodes.length < limit} onClick={() => { setSkip(skip + limit); setSubmitted(true) }}
          className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] disabled:opacity-40 transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}

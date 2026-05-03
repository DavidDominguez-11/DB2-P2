import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, Edit3, Eye, RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  listUsers, listSongs, listArtists, listGenres, listPlaylists,
  createUser, createSong, createArtist, createGenre, createPlaylist,
  updateUser, updateSong, updateArtist, updateGenre, updatePlaylist,
  deleteUser, deleteSong, deleteArtist, deleteGenre, deletePlaylist,
  removeUserProperties, removeSongProperties, removeArtistProperties,
  removeGenreProperties, removePlaylistProperties,
  aggregateUsers, aggregateSongs, aggregateArtists, aggregateGenres, aggregatePlaylists,
} from '../api'
import { Button, Input, Modal, Badge, Loader, Select, StatCard } from '../components/common'
import { useApp } from '../store/AppContext'
import { LABEL_BADGE_COLORS, LABEL_ID_FIELD, LABEL_NAME_FIELD, LABEL_FORM_FIELDS, ALL_LABELS } from '../utils/constants'

// ─── Per-label API maps ────────────────────────────────────────────────────
const LISTERS = { User: listUsers, Song: listSongs, Artist: listArtists, Genre: listGenres, Playlist: listPlaylists }
const CREATORS = { User: createUser, Song: createSong, Artist: createArtist, Genre: createGenre, Playlist: createPlaylist }
const UPDATERS = { User: updateUser, Song: updateSong, Artist: updateArtist, Genre: updateGenre, Playlist: updatePlaylist }
const DELETERS = { User: deleteUser, Song: deleteSong, Artist: deleteArtist, Genre: deleteGenre, Playlist: deletePlaylist }
const PROP_REMOVERS = { User: removeUserProperties, Song: removeSongProperties, Artist: removeArtistProperties, Genre: removeGenreProperties, Playlist: removePlaylistProperties }
const AGGREGATORS = { User: aggregateUsers, Song: aggregateSongs, Artist: aggregateArtists, Genre: aggregateGenres, Playlist: aggregatePlaylists }

const PAGE_SIZE = 25

function DynamicForm({ fields, values, onChange }) {
  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary font-body">
            {f.label} {f.required && <span className="text-rose">*</span>}
          </label>
          {f.type === 'boolean' ? (
            <select
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors font-body"
              value={String(values[f.key] ?? '')}
              onChange={e => onChange(f.key, e.target.value === 'true')}
            >
              <option value="">— seleccionar —</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors font-body"
              value={values[f.key] ?? ''}
              onChange={e => onChange(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={f.type === 'list' ? 'val1, val2, val3' : f.label}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Nodes() {
  const { addToast } = useApp()
  const [label, setLabel] = useState('User')
  const [nodes, setNodes] = useState([])
  const [total, setTotal] = useState(0)
  const [page,  setPage]  = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editNode,   setEditNode]   = useState(null)
  const [viewNode,   setViewNode]   = useState(null)
  const [removePropNode, setRemovePropNode] = useState(null)

  // Aggregation
  const [aggOpen,   setAggOpen]   = useState(false)
  const [aggResult, setAggResult] = useState(null)
  const [aggLoading, setAggLoading] = useState(false)
  const [aggParams, setAggParams] = useState({ group_by: '', agg_field: '', agg_func: 'count' })

  // Forms
  const buildEmpty = (lbl) => {
    const empty = {}
    LABEL_FORM_FIELDS[lbl]?.forEach(f => { empty[f.key] = '' })
    return empty
  }
  const [formData, setFormData] = useState(buildEmpty('User'))
  const [saving, setSaving] = useState(false)
  const [propToRemove, setPropToRemove] = useState('')

  const idField   = LABEL_ID_FIELD[label]
  const nameField = LABEL_NAME_FIELD[label]

  const loadNodes = useCallback(() => {
    setLoading(true); setError(null)
    LISTERS[label]({ skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.data ?? r.data?.items ?? [])
        setNodes(data)
        setTotal(r.data?.total ?? data.length + page * PAGE_SIZE)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [label, page])

  useEffect(() => { setPage(0) }, [label])
  useEffect(() => { loadNodes() }, [loadNodes])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const payload = { ...formData }
      LABEL_FORM_FIELDS[label].forEach(f => {
        if (f.type === 'list' && typeof payload[f.key] === 'string') {
          payload[f.key] = payload[f.key] ? payload[f.key].split(',').map(s => s.trim()) : []
        }
        if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key])
        if (payload[f.key] === '') delete payload[f.key]
      })
      await CREATORS[label](payload)
      addToast(`${label} creado en Neo4j ✓`, 'success')
      setCreateOpen(false)
      loadNodes()
    } catch (e) { addToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const id = editNode[idField]
      const payload = { ...formData }
      // Remove id field and empty values from update body
      delete payload[idField]
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })
      LABEL_FORM_FIELDS[label].forEach(f => {
        if (f.type === 'list' && typeof payload[f.key] === 'string' && payload[f.key]) {
          payload[f.key] = payload[f.key].split(',').map(s => s.trim())
        }
        if (f.type === 'number' && payload[f.key] != null) payload[f.key] = Number(payload[f.key])
      })
      await UPDATERS[label](id, payload)
      addToast(`${label} actualizado ✓`, 'success')
      setEditNode(null)
      loadNodes()
    } catch (e) { addToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (node) => {
    if (!confirm(`¿Eliminar nodo ${node[idField]}?`)) return
    try {
      await DELETERS[label](node[idField])
      addToast(`${label} eliminado ✓`, 'success')
      loadNodes()
    } catch (e) { addToast(e.message, 'error') }
  }

  const handleRemoveProp = async () => {
    if (!propToRemove.trim()) return addToast('Ingresa el nombre de la propiedad', 'info')
    setSaving(true)
    try {
      await PROP_REMOVERS[label](removePropNode[idField], [propToRemove.trim()])
      addToast(`Propiedad "${propToRemove}" eliminada ✓`, 'success')
      setRemovePropNode(null); setPropToRemove('')
      loadNodes()
    } catch (e) { addToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleAggregate = async () => {
    setAggLoading(true); setAggResult(null)
    try {
      const res = await AGGREGATORS[label](aggParams)
      setAggResult(res.data)
    } catch (e) { addToast(e.message, 'error') }
    finally { setAggLoading(false) }
  }

  const openCreate = () => { setFormData(buildEmpty(label)); setCreateOpen(true) }
  const openEdit   = (node) => {
    const flat = {}
    LABEL_FORM_FIELDS[label].forEach(f => {
      flat[f.key] = Array.isArray(node[f.key]) ? node[f.key].join(', ') : (node[f.key] ?? '')
    })
    setFormData(flat); setEditNode(node)
  }

  const filtered = nodes.filter(n =>
    search === '' ||
    String(n[nameField] ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(n[idField] ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Nodos</h1>
          <p className="text-sm text-text-secondary mt-1 font-body">CRUD completo · datos reales desde Neo4j</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAggOpen(true)}>Agregar consulta</Button>
          <Button onClick={openCreate}><Plus size={14} /> Crear {label}</Button>
        </div>
      </div>

      {/* Label tabs */}
      <div className="flex gap-2 flex-wrap">
        {ALL_LABELS.map(l => (
          <button
            key={l}
            onClick={() => setLabel(l)}
            className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${
              label === l
                ? 'bg-accent/15 text-accent-bright border border-accent/30'
                : 'bg-panel border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Search + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors font-body"
            placeholder={`Buscar ${label.toLowerCase()}s...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={loadNodes}><RefreshCw size={14} /></Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose/10 border border-rose/30 rounded-xl px-4 py-3 text-sm text-rose">
          <AlertCircle size={16} /> <span className="font-body flex-1">{error}</span>
          <button onClick={loadNodes} className="text-xs underline opacity-70 hover:opacity-100">Reintentar</button>
        </div>
      )}

      {/* Table */}
      {loading ? <Loader text={`Consultando :${label}...`} /> : (
        <div className="bg-panel border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted">NOMBRE / ID</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted hidden md:table-cell">LABEL</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted hidden lg:table-cell">PROPIEDADES</th>
                  <th className="text-right px-4 py-3 text-xs font-mono text-text-muted">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-text-muted font-body text-sm">
                      Sin resultados
                    </td>
                  </tr>
                ) : filtered.map((node, i) => (
                  <tr key={node[idField] || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary font-body">{node[nameField]}</p>
                      <p className="text-xs text-text-muted font-mono">{node[idField]}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge color={LABEL_BADGE_COLORS[label] || 'muted'}>{label}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-text-muted font-mono truncate max-w-xs">
                        {Object.entries(node)
                          .filter(([k]) => k !== idField && k !== nameField)
                          .slice(0, 3)
                          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : v}`)
                          .join(' · ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewNode(node)} title="Ver" className="p-1.5 rounded-lg hover:bg-muted text-text-muted hover:text-sky transition-colors"><Eye size={13} /></button>
                        <button onClick={() => openEdit(node)} title="Editar" className="p-1.5 rounded-lg hover:bg-muted text-text-muted hover:text-accent transition-colors"><Edit3 size={13} /></button>
                        <button onClick={() => { setRemovePropNode(node); setPropToRemove('') }} title="Eliminar propiedad" className="p-1.5 rounded-lg hover:bg-muted text-text-muted hover:text-amber transition-colors"><X size={13} /></button>
                        <button onClick={() => handleDelete(node)} title="Eliminar nodo" className="p-1.5 rounded-lg hover:bg-rose/10 text-text-muted hover:text-rose transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted font-body">
                Página {page + 1} de {totalPages} · {total.toLocaleString()} nodos total
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={`Crear nodo :${label}`} wide>
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            POST /api/v1/{label.toLowerCase()}s/
          </div>
          <DynamicForm
            fields={LABEL_FORM_FIELDS[label] || []}
            values={formData}
            onChange={(k, v) => setFormData(f => ({ ...f, [k]: v }))}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">Crear en Neo4j</Button>
          </div>
        </div>
      </Modal>

      {/* EDIT Modal */}
      <Modal open={!!editNode} onClose={() => setEditNode(null)} title={`Editar :${label}`} wide>
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            PATCH /api/v1/{label.toLowerCase()}s/{editNode?.[idField]}
          </div>
          <DynamicForm
            fields={(LABEL_FORM_FIELDS[label] || []).filter(f => f.key !== idField)}
            values={formData}
            onChange={(k, v) => setFormData(f => ({ ...f, [k]: v }))}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditNode(null)} className="flex-1">Cancelar</Button>
            <Button onClick={handleUpdate} loading={saving} className="flex-1">Actualizar</Button>
          </div>
        </div>
      </Modal>

      {/* VIEW Modal */}
      <Modal open={!!viewNode} onClose={() => setViewNode(null)} title={`Propiedades del nodo`}>
        {viewNode && (
          <div className="space-y-1">
            {Object.entries(viewNode).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
                <span className="text-xs font-mono text-text-muted flex-shrink-0">{key}</span>
                <span className="text-xs text-text-secondary font-body text-right break-all">
                  {Array.isArray(val) ? val.join(', ') : typeof val === 'boolean' ? (val ? '✓ true' : '✗ false') : String(val ?? '—')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* REMOVE PROPERTY Modal */}
      <Modal open={!!removePropNode} onClose={() => setRemovePropNode(null)} title="Eliminar propiedad del nodo">
        {removePropNode && (
          <div className="space-y-4">
            <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
              DELETE /api/v1/{label.toLowerCase()}s/{removePropNode[idField]}/properties
            </div>
            <p className="text-sm text-text-secondary font-body">
              Nodo: <span className="text-text-primary font-medium">{removePropNode[nameField]}</span>
            </p>
            <Input
              label="Nombre de la propiedad a eliminar"
              value={propToRemove}
              onChange={e => setPropToRemove(e.target.value)}
              placeholder="ej: email"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setRemovePropNode(null)} className="flex-1">Cancelar</Button>
              <Button variant="danger" onClick={handleRemoveProp} loading={saving} className="flex-1">Eliminar propiedad</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AGGREGATE Modal */}
      <Modal open={aggOpen} onClose={() => setAggOpen(false)} title={`Agregación :${label}`} wide>
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            GET /api/v1/{label.toLowerCase()}s/aggregate?group_by=...&agg_field=...&agg_func=...
          </div>
          <Input label="group_by" value={aggParams.group_by} onChange={e => setAggParams(p => ({...p, group_by: e.target.value}))} placeholder="premium" />
          <Input label="agg_field" value={aggParams.agg_field} onChange={e => setAggParams(p => ({...p, agg_field: e.target.value}))} placeholder="user_id" />
          <Select
            label="agg_func"
            options={['count','sum','avg','min','max'].map(v => ({value: v, label: v}))}
            value={aggParams.agg_func}
            onChange={e => setAggParams(p => ({...p, agg_func: e.target.value}))}
          />
          <Button onClick={handleAggregate} loading={aggLoading} className="w-full">Ejecutar agregación</Button>
          {aggResult && (
            <div className="bg-muted/40 border border-border rounded-xl p-3 overflow-x-auto">
              <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">
                {JSON.stringify(aggResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

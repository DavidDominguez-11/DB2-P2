import { useState, useRef } from 'react'
import { Upload, Zap, Trash2, RefreshCw, Database, CheckCircle, Link, Activity, Shield } from 'lucide-react'
import {
  bulkUpdateNodes, bulkDeleteNodes, bulkRemoveNodeProperty,
  bulkUpdateInteractions, bulkRemoveInteractionProperty, bulkDeleteInteractions,
  createInteraction, deleteInteraction,
  uploadCSV, getGraphStats, checkConnectivity, createConstraints,
} from '../api'
import { Button, Input, Select, Badge, Loader } from '../components/common'
import { useApp } from '../store/AppContext'
import { ALL_LABELS, ALL_REL_TYPES } from '../utils/constants'

const LABEL_OPTS   = ALL_LABELS.map(v => ({ value: v, label: v }))
const REL_OPTS     = ALL_REL_TYPES.map(v => ({ value: v, label: v }))
const AGG_FUNC_OPTS = ['count','sum','avg','min','max'].map(v => ({ value: v, label: v }))

function ResultBadge({ result }) {
  if (result == null) return null
  return (
    <div className="flex items-center gap-2 text-sm text-neon font-mono animate-fade-up">
      <CheckCircle size={14} />
      {typeof result === 'object' ? JSON.stringify(result) : String(result)}
    </div>
  )
}

function SectionCard({ icon: Icon, iconColor, title, children }) {
  return (
    <section className="bg-panel border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: iconColor }} />
        <h2 className="font-display font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function Admin() {
  const { addToast } = useApp()

  // ── Bulk node update ──────────────────────────────────────────────────────
  const [bulkNodeLabel,   setBulkNodeLabel]   = useState('User')
  const [bulkFilterProp,  setBulkFilterProp]  = useState('')
  const [bulkFilterVal,   setBulkFilterVal]   = useState('')
  const [bulkUpdateKey,   setBulkUpdateKey]   = useState('')
  const [bulkUpdateVal,   setBulkUpdateVal]   = useState('')
  const [bulkNodeLoading, setBulkNodeLoading] = useState(false)
  const [bulkNodeResult,  setBulkNodeResult]  = useState(null)

  // ── Bulk node remove prop ─────────────────────────────────────────────────
  const [bnrLabel,    setBnrLabel]    = useState('User')
  const [bnrProp,     setBnrProp]     = useState('')
  const [bnrFilProp,  setBnrFilProp]  = useState('')
  const [bnrFilVal,   setBnrFilVal]   = useState('')
  const [bnrLoading,  setBnrLoading]  = useState(false)
  const [bnrResult,   setBnrResult]   = useState(null)

  // ── Bulk node delete ──────────────────────────────────────────────────────
  const [bndLabel,   setBndLabel]   = useState('User')
  const [bndFilProp, setBndFilProp] = useState('')
  const [bndFilVal,  setBndFilVal]  = useState('')
  const [bndLoading, setBndLoading] = useState(false)
  const [bndResult,  setBndResult]  = useState(null)

  // ── Bulk interaction update ───────────────────────────────────────────────
  const [biRelType,   setBiRelType]   = useState('FOLLOWS')
  const [biFilProp,   setBiFilProp]   = useState('')
  const [biFilVal,    setBiFilVal]    = useState('')
  const [biUpdateKey, setBiUpdateKey] = useState('')
  const [biUpdateVal, setBiUpdateVal] = useState('')
  const [biLoading,   setBiLoading]   = useState(false)
  const [biResult,    setBiResult]    = useState(null)

  // ── Bulk interaction remove prop ──────────────────────────────────────────
  const [birRelType,  setBirRelType]  = useState('FOLLOWS')
  const [birProp,     setBirProp]     = useState('')
  const [birFilProp,  setBirFilProp]  = useState('')
  const [birFilVal,   setBirFilVal]   = useState('')
  const [birLoading,  setBirLoading]  = useState(false)
  const [birResult,   setBirResult]   = useState(null)

  // ── Create interaction ────────────────────────────────────────────────────
  const [ciFromLabel, setCiFromLabel] = useState('User')
  const [ciFromId,    setCiFromId]    = useState('')
  const [ciToLabel,   setCiToLabel]   = useState('Song')
  const [ciToId,      setCiToId]      = useState('')
  const [ciRelType,   setCiRelType]   = useState('LISTENED')
  const [ciProps,     setCiProps]     = useState('') // JSON string
  const [ciLoading,   setCiLoading]   = useState(false)

  // ── CSV upload ────────────────────────────────────────────────────────────
  const [csvLabel,   setCsvLabel]   = useState('Song')
  const [csvFile,    setCsvFile]    = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const fileRef = useRef()

  // ── Stats & maintenance ───────────────────────────────────────────────────
  const [stats,       setStats]      = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [connectivity, setConnectivity] = useState(null)
  const [connLoading,  setConnLoading]  = useState(false)

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleBulkNodeUpdate = async () => {
    if (!bulkFilterProp || !bulkUpdateKey) return addToast('Completa filtro y propiedad a actualizar', 'info')
    setBulkNodeLoading(true); setBulkNodeResult(null)
    try {
      const res = await bulkUpdateNodes({
        label: bulkNodeLabel,
        filter_property: bulkFilterProp,
        filter_value: bulkFilterVal,
        update_data: { [bulkUpdateKey]: bulkUpdateVal },
      })
      const affected = res.data?.affected ?? res.data?.data?.affected ?? res.data
      setBulkNodeResult(`${affected ?? '✓'} nodos afectados`)
      addToast(`Bulk SET en :${bulkNodeLabel} ✓`, 'success')
    } catch (e) { addToast(e.message, 'error') }
    finally { setBulkNodeLoading(false) }
  }

  const handleBulkNodeRemoveProp = async () => {
    if (!bnrProp) return addToast('Ingresa la propiedad a eliminar', 'info')
    setBnrLoading(true); setBnrResult(null)
    try {
      const body = { label: bnrLabel, property_to_remove: bnrProp }
      if (bnrFilProp) { body.filter_property = bnrFilProp; body.filter_value = bnrFilVal }
      const res = await bulkRemoveNodeProperty(body)
      const affected = res.data?.affected ?? res.data?.data?.affected ?? '✓'
      setBnrResult(`${affected} nodos afectados`)
      addToast(`Propiedad "${bnrProp}" eliminada en :${bnrLabel} ✓`, 'success')
    } catch (e) { addToast(e.message, 'error') }
    finally { setBnrLoading(false) }
  }

  const handleBulkNodeDelete = async () => {
    if (!bndFilProp) return addToast('Define un filtro para no borrar todo', 'info')
    if (!confirm(`¿Eliminar nodos :${bndLabel} donde ${bndFilProp} = ${bndFilVal}?`)) return
    setBndLoading(true); setBndResult(null)
    try {
      const res = await bulkDeleteNodes({ label: bndLabel, filter_property: bndFilProp, filter_value: bndFilVal })
      const affected = res.data?.affected ?? res.data?.data?.affected ?? '✓'
      setBndResult(`${affected} nodos eliminados`)
      addToast(`Bulk DELETE en :${bndLabel} ✓`, 'success')
    } catch (e) { addToast(e.message, 'error') }
    finally { setBndLoading(false) }
  }

  const handleBulkInteractionUpdate = async () => {
    if (!biFilProp || !biUpdateKey) return addToast('Completa filtro y campo a actualizar', 'info')
    setBiLoading(true); setBiResult(null)
    try {
      const res = await bulkUpdateInteractions({
        rel_type: biRelType,
        filter_property: biFilProp,
        filter_value: biFilVal,
        update_data: { [biUpdateKey]: biUpdateVal },
      })
      const affected = res.data?.affected ?? res.data?.data?.affected ?? '✓'
      setBiResult(`${affected} relaciones afectadas`)
      addToast(`Bulk update en [:${biRelType}] ✓`, 'success')
    } catch (e) { addToast(e.message, 'error') }
    finally { setBiLoading(false) }
  }

  const handleBulkInteractionRemoveProp = async () => {
    if (!birProp) return addToast('Ingresa la propiedad a eliminar', 'info')
    setBirLoading(true); setBirResult(null)
    try {
      const body = { rel_type: birRelType, property_to_remove: birProp }
      if (birFilProp) { body.filter_property = birFilProp; body.filter_value = birFilVal }
      const res = await bulkRemoveInteractionProperty(body)
      const affected = res.data?.affected ?? res.data?.data?.affected ?? '✓'
      setBirResult(`${affected} relaciones afectadas`)
      addToast(`Propiedad "${birProp}" eliminada en [:${birRelType}] ✓`, 'success')
    } catch (e) { addToast(e.message, 'error') }
    finally { setBirLoading(false) }
  }

  const handleCreateInteraction = async () => {
    if (!ciFromId || !ciToId) return addToast('Ingresa nodo origen y destino', 'info')
    setCiLoading(true)
    try {
      let props = {}
      if (ciProps.trim()) {
        try { props = JSON.parse(ciProps) } catch { addToast('JSON de propiedades inválido', 'error'); return }
      }
      await createInteraction({ from_label: ciFromLabel, from_id: ciFromId, to_label: ciToLabel, to_id: ciToId, rel_type: ciRelType, properties: props })
      addToast(`Relación [:${ciRelType}] creada en Neo4j ✓`, 'success')
      setCiFromId(''); setCiToId(''); setCiProps('')
    } catch (e) { addToast(e.message, 'error') }
    finally { setCiLoading(false) }
  }

  const handleCSV = async () => {
    if (!csvFile) return addToast('Selecciona un archivo CSV', 'info')
    setCsvLoading(true)
    try {
      const res = await uploadCSV(csvLabel, csvFile)
      const msg = res.data?.message ?? res.data?.data?.message ?? 'Carga completa'
      addToast(`CSV → :${csvLabel}: ${msg}`, 'success')
      setCsvFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) { addToast(e.message, 'error') }
    finally { setCsvLoading(false) }
  }

  const handleLoadStats = async () => {
    setStatsLoading(true)
    try {
      const res = await getGraphStats()
      setStats(res.data?.data ?? res.data)
    } catch (e) { addToast(e.message, 'error') }
    finally { setStatsLoading(false) }
  }

  const handleCheckConnectivity = async () => {
    setConnLoading(true)
    try {
      const res = await checkConnectivity()
      setConnectivity(res.data?.data ?? res.data)
    } catch (e) { addToast(e.message, 'error') }
    finally { setConnLoading(false) }
  }

  const handleCreateConstraints = async () => {
    try {
      await createConstraints()
      addToast('Constraints creados ✓', 'success')
    } catch (e) { addToast(e.message, 'error') }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pt-2">
        <h1 className="font-display text-2xl font-bold text-text-primary">Panel Admin</h1>
        <p className="text-sm text-text-secondary mt-1 font-body">
          Operaciones bulk, relaciones, CSV y mantenimiento · datos reales Neo4j
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── BULK NODE UPDATE ────────────────────────────────────────────── */}
        <SectionCard icon={Zap} iconColor="#f5a623" title="Bulk SET — Nodos">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            PATCH /api/v1/bulk/nodes
          </div>
          <Select label="Label" options={LABEL_OPTS} value={bulkNodeLabel} onChange={e => setBulkNodeLabel(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="filter_property" value={bulkFilterProp} onChange={e => setBulkFilterProp(e.target.value)} placeholder="premium" />
            <Input label="filter_value" value={bulkFilterVal} onChange={e => setBulkFilterVal(e.target.value)} placeholder="false" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="propiedad a SET" value={bulkUpdateKey} onChange={e => setBulkUpdateKey(e.target.value)} placeholder="activo" />
            <Input label="nuevo valor" value={bulkUpdateVal} onChange={e => setBulkUpdateVal(e.target.value)} placeholder="false" />
          </div>
          <ResultBadge result={bulkNodeResult} />
          <Button onClick={handleBulkNodeUpdate} loading={bulkNodeLoading} className="w-full">
            <RefreshCw size={13} /> Ejecutar SET
          </Button>
        </SectionCard>

        {/* ── BULK NODE REMOVE PROPERTY ───────────────────────────────────── */}
        <SectionCard icon={Trash2} iconColor="#ff4d6d" title="Bulk REMOVE propiedad — Nodos">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            DELETE /api/v1/bulk/nodes/properties
          </div>
          <Select label="Label" options={LABEL_OPTS} value={bnrLabel} onChange={e => setBnrLabel(e.target.value)} />
          <Input label="property_to_remove *" value={bnrProp} onChange={e => setBnrProp(e.target.value)} placeholder="email" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="filter_property (opcional)" value={bnrFilProp} onChange={e => setBnrFilProp(e.target.value)} placeholder="premium" />
            <Input label="filter_value" value={bnrFilVal} onChange={e => setBnrFilVal(e.target.value)} placeholder="true" />
          </div>
          <ResultBadge result={bnrResult} />
          <Button variant="danger" onClick={handleBulkNodeRemoveProp} loading={bnrLoading} className="w-full">
            <Trash2 size={13} /> REMOVE propiedad
          </Button>
        </SectionCard>

        {/* ── BULK NODE DELETE ─────────────────────────────────────────────── */}
        <SectionCard icon={Trash2} iconColor="#ef4444" title="Bulk DELETE — Nodos">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            DELETE /api/v1/bulk/nodes
          </div>
          <Select label="Label" options={LABEL_OPTS} value={bndLabel} onChange={e => setBndLabel(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="filter_property *" value={bndFilProp} onChange={e => setBndFilProp(e.target.value)} placeholder="activo" />
            <Input label="filter_value" value={bndFilVal} onChange={e => setBndFilVal(e.target.value)} placeholder="false" />
          </div>
          <ResultBadge result={bndResult} />
          <Button variant="danger" onClick={handleBulkNodeDelete} loading={bndLoading} className="w-full">
            <Trash2 size={13} /> Eliminar nodos con filtro
          </Button>
        </SectionCard>

        {/* ── BULK INTERACTION UPDATE ──────────────────────────────────────── */}
        <SectionCard icon={Link} iconColor="#7c6aff" title="Bulk SET — Relaciones">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            PATCH /api/v1/interactions/bulk/update
          </div>
          <Select label="Tipo relación" options={REL_OPTS} value={biRelType} onChange={e => setBiRelType(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="filter_property" value={biFilProp} onChange={e => setBiFilProp(e.target.value)} placeholder="completado" />
            <Input label="filter_value" value={biFilVal} onChange={e => setBiFilVal(e.target.value)} placeholder="false" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="propiedad a SET" value={biUpdateKey} onChange={e => setBiUpdateKey(e.target.value)} placeholder="revisado" />
            <Input label="nuevo valor" value={biUpdateVal} onChange={e => setBiUpdateVal(e.target.value)} placeholder="true" />
          </div>
          <ResultBadge result={biResult} />
          <Button onClick={handleBulkInteractionUpdate} loading={biLoading} className="w-full">
            <RefreshCw size={13} /> Ejecutar SET
          </Button>
        </SectionCard>

        {/* ── BULK INTERACTION REMOVE PROP ─────────────────────────────────── */}
        <SectionCard icon={Trash2} iconColor="#f472b6" title="Bulk REMOVE propiedad — Relaciones">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            DELETE /api/v1/interactions/bulk/properties
          </div>
          <Select label="Tipo relación" options={REL_OPTS} value={birRelType} onChange={e => setBirRelType(e.target.value)} />
          <Input label="property_to_remove *" value={birProp} onChange={e => setBirProp(e.target.value)} placeholder="intensidad" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="filter_property (opcional)" value={birFilProp} onChange={e => setBirFilProp(e.target.value)} placeholder="completado" />
            <Input label="filter_value" value={birFilVal} onChange={e => setBirFilVal(e.target.value)} placeholder="true" />
          </div>
          <ResultBadge result={birResult} />
          <Button variant="danger" onClick={handleBulkInteractionRemoveProp} loading={birLoading} className="w-full">
            <Trash2 size={13} /> REMOVE propiedad
          </Button>
        </SectionCard>

        {/* ── CREATE INTERACTION ──────────────────────────────────────────── */}
        <SectionCard icon={Link} iconColor="#34d399" title="Crear Relación">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            POST /api/v1/interactions/
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="from_label" options={LABEL_OPTS} value={ciFromLabel} onChange={e => setCiFromLabel(e.target.value)} />
            <Input label="from_id *" value={ciFromId} onChange={e => setCiFromId(e.target.value)} placeholder="u1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="to_label" options={LABEL_OPTS} value={ciToLabel} onChange={e => setCiToLabel(e.target.value)} />
            <Input label="to_id *" value={ciToId} onChange={e => setCiToId(e.target.value)} placeholder="s1" />
          </div>
          <Select label="rel_type" options={REL_OPTS} value={ciRelType} onChange={e => setCiRelType(e.target.value)} />
          <Input label="properties (JSON opcional)" value={ciProps} onChange={e => setCiProps(e.target.value)} placeholder='{"fecha": "2024-01-01"}' />
          <Button variant="neon" onClick={handleCreateInteraction} loading={ciLoading} className="w-full">
            <Link size={13} /> Crear relación
          </Button>
        </SectionCard>

        {/* ── CSV UPLOAD ──────────────────────────────────────────────────── */}
        <SectionCard icon={Upload} iconColor="#38bdf8" title="Carga de CSV">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            POST /api/v1/bulk/csv/{'{label}'}
          </div>
          <Select label="Label destino" options={LABEL_OPTS} value={csvLabel} onChange={e => setCsvLabel(e.target.value)} />
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={20} className="mx-auto text-text-muted mb-2" />
            <p className="text-sm text-text-secondary font-body">
              {csvFile ? csvFile.name : 'Click para seleccionar CSV'}
            </p>
            <p className="text-xs text-text-muted mt-1 font-mono">
              {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : '.csv · usa MERGE internamente'}
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files[0])} />
          <Button onClick={handleCSV} loading={csvLoading} className="w-full">
            <Database size={13} /> Importar a Neo4j
          </Button>
        </SectionCard>

      </div>

      {/* ── MAINTENANCE ───────────────────────────────────────────────────── */}
      <SectionCard icon={Activity} iconColor="#00e5a0" title="Mantenimiento del Grafo">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="secondary" onClick={handleLoadStats} loading={statsLoading} className="w-full">
            <Activity size={13} /> Stats del grafo
          </Button>
          <Button variant="secondary" onClick={handleCheckConnectivity} loading={connLoading} className="w-full">
            <CheckCircle size={13} /> Verificar conectividad
          </Button>
          <Button variant="secondary" onClick={handleCreateConstraints} className="w-full">
            <Shield size={13} /> Crear constraints
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            {stats.total_nodes != null && (
              <div className="bg-muted/40 border border-border rounded-xl p-3">
                <p className="text-xs text-text-muted font-body">Nodos totales</p>
                <p className="text-xl font-display font-bold gradient-text">{stats.total_nodes?.toLocaleString()}</p>
              </div>
            )}
            {stats.total_relationships != null && (
              <div className="bg-muted/40 border border-border rounded-xl p-3">
                <p className="text-xs text-text-muted font-body">Relaciones</p>
                <p className="text-xl font-display font-bold text-neon">{stats.total_relationships?.toLocaleString()}</p>
              </div>
            )}
            {stats.label_counts && Object.entries(stats.label_counts).slice(0, 6).map(([k, v]) => (
              <div key={k} className="bg-muted/40 border border-border rounded-xl p-3">
                <p className="text-xs text-text-muted font-mono">{k}</p>
                <p className="text-lg font-display font-bold text-text-primary">{Number(v).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {connectivity && (
          <div className="bg-muted/40 border border-neon/20 rounded-xl p-4 mt-2">
            <p className="text-xs font-mono text-neon mb-2">Resultado conectividad</p>
            <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">
              {JSON.stringify(connectivity, null, 2)}
            </pre>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

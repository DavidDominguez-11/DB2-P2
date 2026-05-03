import { useEffect, useState, useRef, useCallback } from 'react'
import { listUsers, listSongs, listArtists, listGenres, listPlaylists, listInteractionsByType } from '../api'
import { Loader, Button } from '../components/common'
import { X, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react'
import { LABEL_COLORS, REL_COLORS, ALL_REL_TYPES } from '../utils/constants'

// Build graph data from raw API arrays
function buildGraphData(data) {
  const nodes = []
  const links = []

  const add = (arr, label, idField, nameField) => {
    if (!Array.isArray(arr)) return
    arr.forEach(item => {
      if (!item[idField]) return
      nodes.push({
        id:    item[idField],
        label,
        name:  item[nameField] || item[idField],
        size:  label === 'Genre' ? 9 : label === 'User' ? 8 : 5,
        color: LABEL_COLORS[label],
        ...item,
      })
    })
  }

  add(data.users,     'User',     'user_id',     'username')
  add(data.songs,     'Song',     'song_id',     'titulo')
  add(data.artists,   'Artist',   'artist_id',   'nombre')
  add(data.genres,    'Genre',    'genre_id',    'nombre')
  add(data.playlists, 'Playlist', 'playlist_id', 'nombre')

  // Add relationship links from interactions
  const addLinks = (arr, type) => {
    if (!Array.isArray(arr)) return
    arr.forEach(rel => {
      const src = rel.from_id  ?? rel.source_id ?? rel.from
      const tgt = rel.to_id    ?? rel.target_id ?? rel.to
      if (src && tgt) links.push({ source: src, target: tgt, type, color: REL_COLORS[type] || '#2a2a3e' })
    })
  }

  Object.entries(data.interactions || {}).forEach(([type, arr]) => addLinks(arr, type))

  return { nodes, links }
}

export default function Explorer() {
  const [graphData,   setGraphData]   = useState({ nodes: [], links: [] })
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [selected,    setSelected]    = useState(null)
  const [visibleRels, setVisibleRels] = useState(new Set(ALL_REL_TYPES))
  const [ForceGraph2D, setForceGraph2D] = useState(null)
  const fgRef = useRef()

  // Dynamic import
  useEffect(() => {
    import('react-force-graph-2d').then(m => setForceGraph2D(() => m.default))
  }, [])

  const loadGraph = async () => {
    setLoading(true); setError(null)
    try {
      // Fetch all node types in parallel
      const [usersRes, songsRes, artistsRes, genresRes, playlistsRes] = await Promise.allSettled([
        listUsers({ limit: 100 }),
        listSongs({ limit: 100 }),
        listArtists({ limit: 100 }),
        listGenres({ limit: 100 }),
        listPlaylists({ limit: 100 }),
      ])

      // Fetch key relationship types in parallel
      const relTypes = ['FOLLOWS', 'LISTENED', 'BY', 'BELONGS_TO', 'INCLUDES', 'CREATED_PLAYLIST']
      const relResults = await Promise.allSettled(
        relTypes.map(t => listInteractionsByType(t, { limit: 200 }))
      )

      const extract = (res) => {
        if (res.status !== 'fulfilled') return []
        const d = res.value.data
        return Array.isArray(d) ? d : (d?.data ?? [])
      }

      const interactions = {}
      relTypes.forEach((t, i) => { interactions[t] = extract(relResults[i]) })

      const raw = {
        users:     extract(usersRes),
        songs:     extract(songsRes),
        artists:   extract(artistsRes),
        genres:    extract(genresRes),
        playlists: extract(playlistsRes),
        interactions,
      }

      setGraphData(buildGraphData(raw))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGraph() }, [])

  const filteredData = {
    nodes: graphData.nodes,
    links: graphData.links.filter(l => visibleRels.has(l.type)),
  }

  const toggleRel = (type) => setVisibleRels(prev => {
    const next = new Set(prev)
    next.has(type) ? next.delete(type) : next.add(type)
    return next
  })

  const handleNodeClick = useCallback((node) => {
    setSelected(node)
    fgRef.current?.centerAt(node.x, node.y, 800)
    fgRef.current?.zoom(3, 800)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader text="Cargando grafo desde Neo4j..." />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <AlertCircle size={32} className="text-rose" />
      <p className="text-rose font-body">{error}</p>
      <Button onClick={loadGraph}><RefreshCw size={14} /> Reintentar</Button>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-4 pb-4 -mt-2 relative">
      {/* Left controls */}
      <div className="w-52 flex-shrink-0 space-y-5 overflow-y-auto">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2 font-body uppercase tracking-wider">Nodos por label</p>
          <div className="space-y-1.5">
            {Object.entries(LABEL_COLORS).map(([label, color]) => {
              const count = graphData.nodes.filter(n => n.label === label).length
              return (
                <div key={label} className="flex items-center justify-between text-xs font-body">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-text-secondary">{label}</span>
                  </div>
                  <span className="font-mono text-text-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2 font-body uppercase tracking-wider">Relaciones</p>
          <div className="space-y-1.5">
            {ALL_REL_TYPES.map(type => {
              const count = graphData.links.filter(l => l.type === type).length
              if (count === 0) return null
              return (
                <button
                  key={type}
                  onClick={() => toggleRel(type)}
                  className={`flex items-center gap-2 text-xs w-full text-left transition-opacity ${visibleRels.has(type) ? 'opacity-100' : 'opacity-30'}`}
                >
                  <div className="w-3 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: REL_COLORS[type] || '#666' }} />
                  <span className="text-text-secondary font-mono flex-1">{type}</span>
                  {visibleRels.has(type)
                    ? <Eye size={10} className="text-text-muted flex-shrink-0" />
                    : <EyeOff size={10} className="text-text-muted flex-shrink-0" />
                  }
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg p-3 space-y-1">
          <p className="text-xs font-mono">
            <span className="text-accent">{filteredData.nodes.length}</span> nodos
          </p>
          <p className="text-xs font-mono">
            <span className="text-neon">{filteredData.links.length}</span> aristas visibles
          </p>
          <p className="text-[11px] text-text-muted mt-2 font-body">Click en un nodo para ver sus propiedades</p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadGraph} className="w-full">
          <RefreshCw size={12} /> Recargar grafo
        </Button>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 bg-panel border border-border rounded-2xl overflow-hidden relative">
        {ForceGraph2D ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={filteredData}
            nodeLabel="name"
            nodeColor={node => LABEL_COLORS[node.label] || '#7c6aff'}
            nodeRelSize={4}
            nodeVal={node => node.size || 5}
            linkColor={link => link.color || '#2a2a3e'}
            linkWidth={1}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            backgroundColor="#0d0d14"
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const r = (node.size || 5) * 0.7
              ctx.beginPath()
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
              ctx.fillStyle = LABEL_COLORS[node.label] || '#7c6aff'
              ctx.fill()
              if (globalScale > 1.5) {
                const fontSize = 10 / globalScale
                const label = node.name?.slice(0, 18) || ''
                ctx.font = `${fontSize}px "DM Sans", sans-serif`
                ctx.fillStyle = 'rgba(240,238,255,0.75)'
                ctx.textAlign = 'center'
                ctx.fillText(label, node.x, node.y + r + fontSize * 1.2)
              }
            }}
          />
        ) : <Loader text="Inicializando visualizador..." />}
      </div>

      {/* Node detail panel */}
      {selected && (
        <div className="absolute right-0 top-0 w-72 bg-panel border border-border rounded-2xl p-5 shadow-2xl animate-fade-up max-h-full overflow-y-auto z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LABEL_COLORS[selected.label] || '#7c6aff' }} />
              <span className="text-xs font-mono text-text-secondary bg-muted px-2 py-0.5 rounded">{selected.label}</span>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-muted rounded-lg text-text-muted">
              <X size={14} />
            </button>
          </div>

          <p className="font-display font-semibold text-text-primary mb-4 text-sm break-words">
            {selected.name}
          </p>

          <div className="space-y-2">
            {Object.entries(selected)
              .filter(([k]) => !['id','x','y','vx','vy','index','color','size','label','name'].includes(k))
              .map(([key, val]) => (
                <div key={key} className="flex justify-between gap-3 py-1.5 border-b border-border/40">
                  <span className="text-xs text-text-muted font-mono flex-shrink-0">{key}</span>
                  <span className="text-xs text-text-secondary font-body text-right break-all">
                    {Array.isArray(val)
                      ? val.join(', ')
                      : typeof val === 'boolean'
                        ? (val ? '✓ true' : '✗ false')
                        : String(val ?? '—')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

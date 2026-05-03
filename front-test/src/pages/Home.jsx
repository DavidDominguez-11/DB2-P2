import { useEffect, useState } from 'react'
import { PenSquare, RefreshCw, AlertCircle } from 'lucide-react'
import { listPosts, getGraphStats, createPost } from '../api'
import PostCard from '../components/music/PostCard'
import { Loader, StatCard, Button, Modal, Input } from '../components/common'
import { useApp } from '../store/AppContext'

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 bg-rose/10 border border-rose/30 rounded-xl px-4 py-3 text-sm text-rose">
      <AlertCircle size={16} className="flex-shrink-0" />
      <span className="flex-1 font-body">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs underline opacity-70 hover:opacity-100">
          <RefreshCw size={12} /> Reintentar
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const [posts, setPosts]       = useState([])
  const [stats, setStats]       = useState(null)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError]       = useState(null)
  const [postModal, setPostModal] = useState(false)
  const [postForm, setPostForm] = useState({ post_id: '', caption: '', fecha: '', tipo: 'track_share', privacidad: 'public', hashtags: '' })
  const [saving, setSaving]     = useState(false)
  const { user, addToast }      = useApp()

  const loadPosts = () => {
    setLoadingPosts(true)
    setError(null)
    listPosts({ limit: 25 })
      .then(r => setPosts(Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingPosts(false))
  }

  const loadStats = () => {
    setLoadingStats(true)
    getGraphStats()
      .then(r => setStats(r.data?.data ?? r.data))
      .catch(() => {}) // stats failure is non-blocking
      .finally(() => setLoadingStats(false))
  }

  useEffect(() => { loadPosts(); loadStats() }, [])

  const handleCreatePost = async () => {
    if (!postForm.caption || !postForm.fecha || !postForm.post_id) {
      return addToast('Completa los campos requeridos', 'error')
    }
    setSaving(true)
    try {
      const payload = {
        ...postForm,
        hashtags: postForm.hashtags ? postForm.hashtags.split(',').map(h => h.trim().replace('#','')) : [],
      }
      await createPost(payload)
      addToast('Post creado en Neo4j ✓', 'success')
      setPostModal(false)
      loadPosts()
    } catch (e) { addToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const nameOf = (node) => node?.username || node?.user_id || 'usuario'

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Feed</h1>
          <p className="text-sm text-text-secondary mt-1 font-body">
            Publicaciones de la red — datos en vivo desde Neo4j
          </p>
        </div>
        <Button onClick={() => setPostModal(true)}>
          <PenSquare size={13} /> Nuevo post
        </Button>
      </div>

      {/* Stats row */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Nodos totales" value={stats.total_nodes ?? stats.totalNodes ?? '—'} accent />
          <StatCard label="Relaciones" value={stats.total_relationships ?? stats.totalRelationships ?? '—'} />
          <StatCard label="Labels" value={stats.label_counts ? Object.keys(stats.label_counts).length : stats.labels ? Object.keys(stats.labels).length : '—'} sub="tipos de nodo" />
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={loadPosts} />}

      {loadingPosts ? <Loader text="Consultando Neo4j..." /> : (
        posts.length === 0
          ? <div className="text-center py-16 text-text-muted font-body">No hay posts cargados aún.</div>
          : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={post.post_id || i} style={{ animationDelay: `${i * 60}ms` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )
      )}

      {/* Create Post Modal */}
      <Modal open={postModal} onClose={() => setPostModal(false)} title="Crear Post">
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted">
            POST /api/v1/posts/
          </div>
          <Input label="post_id *" value={postForm.post_id} onChange={e => setPostForm(f=>({...f,post_id:e.target.value}))} placeholder="post_001" />
          <Input label="caption *" value={postForm.caption} onChange={e => setPostForm(f=>({...f,caption:e.target.value}))} placeholder="Comparte algo..." />
          <Input label="fecha *" type="date" value={postForm.fecha} onChange={e => setPostForm(f=>({...f,fecha:e.target.value}))} />
          <Input label="tipo" value={postForm.tipo} onChange={e => setPostForm(f=>({...f,tipo:e.target.value}))} placeholder="track_share" />
          <Input label="hashtags (coma-separados)" value={postForm.hashtags} onChange={e => setPostForm(f=>({...f,hashtags:e.target.value}))} placeholder="electronic, neo4j" />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setPostModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreatePost} loading={saving} className="flex-1">Crear en Neo4j</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

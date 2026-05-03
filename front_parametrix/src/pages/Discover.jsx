import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Users, Music2, BarChart3, RefreshCw, AlertCircle } from 'lucide-react'
import {
  getRecommendations, getPopularSongs, getGenreDistribution,
  listArtists, getSimilarUsers, getInfluence
} from '../api'
import { Loader, Badge, Button, StatCard } from '../components/common'
import { useApp } from '../store/AppContext'
import { LABEL_COLORS } from '../utils/constants'
import { formatDuration } from '../utils/neo4jParser'

function Section({ icon: Icon, iconColor, title, badge, children, loading, error, onRetry }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color: iconColor }} />
        <h2 className="font-display font-semibold text-text-primary">{title}</h2>
        {badge && <Badge color="accent">{badge}</Badge>}
        {onRetry && (
          <button onClick={onRetry} className="ml-auto text-xs text-text-muted hover:text-accent flex items-center gap-1">
            <RefreshCw size={11} /> actualizar
          </button>
        )}
      </div>
      {loading ? <Loader text="Consultando Neo4j..." /> : error ? (
        <div className="flex items-center gap-2 text-sm text-rose/80 font-body bg-rose/5 border border-rose/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} /> {error}
        </div>
      ) : children}
    </section>
  )
}

export default function Discover() {
  const { user } = useApp()

  const [recs,         setRecs]         = useState([])
  const [recsLoading,  setRecsLoading]  = useState(true)
  const [recsError,    setRecsError]    = useState(null)

  const [popular,      setPopular]      = useState([])
  const [popLoading,   setPopLoading]   = useState(true)
  const [popError,     setPopError]     = useState(null)

  const [genres,       setGenres]       = useState([])
  const [genreLoading, setGenreLoading] = useState(true)
  const [genreError,   setGenreError]   = useState(null)

  const [artists,      setArtists]      = useState([])
  const [artLoading,   setArtLoading]   = useState(true)

  const [similar,      setSimilar]      = useState([])
  const [simLoading,   setSimLoading]   = useState(true)
  const [simError,     setSimError]     = useState(null)

  const loadRecs = () => {
    setRecsLoading(true); setRecsError(null)
    getRecommendations(user.user_id)
      .then(r => setRecs(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(e => setRecsError(e.message))
      .finally(() => setRecsLoading(false))
  }

  const loadPopular = () => {
    setPopLoading(true); setPopError(null)
    getPopularSongs({ limit: 6 })
      .then(r => setPopular(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(e => setPopError(e.message))
      .finally(() => setPopLoading(false))
  }

  const loadGenres = () => {
    setGenreLoading(true); setGenreError(null)
    getGenreDistribution()
      .then(r => setGenres(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(e => setGenreError(e.message))
      .finally(() => setGenreLoading(false))
  }

  const loadArtists = () => {
    setArtLoading(true)
    listArtists({ limit: 8 })
      .then(r => setArtists(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .finally(() => setArtLoading(false))
  }

  const loadSimilar = () => {
    setSimLoading(true); setSimError(null)
    getSimilarUsers(user.user_id, 5)
      .then(r => setSimilar(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(e => setSimError(e.message))
      .finally(() => setSimLoading(false))
  }

  useEffect(() => {
    loadRecs(); loadPopular(); loadGenres(); loadArtists(); loadSimilar()
  }, [user.user_id])

  return (
    <div className="space-y-10 pb-12">
      <div className="pt-2">
        <h1 className="font-display text-2xl font-bold text-text-primary">Descubrir</h1>
        <p className="text-sm text-text-secondary mt-1 font-body">
          Analytics y recomendaciones en vivo desde Neo4j AuraDB
        </p>
      </div>

      {/* Recommendations (Jaccard Similarity) */}
      <Section icon={Sparkles} iconColor="#7c6aff" title="Para ti" badge="Jaccard Similarity" loading={recsLoading} error={recsError} onRetry={loadRecs}>
        {recs.length === 0
          ? <p className="text-sm text-text-muted font-body">Sin recomendaciones aún — escucha más canciones.</p>
          : (
            <div className="space-y-3">
              {recs.map((rec, i) => {
                // API may return { song, reason, similarity } OR flat { titulo, ... }
                const song   = rec.song ?? rec
                const reason = rec.reason ?? rec.motivo ?? 'Basado en tu grafo'
                const score  = rec.similarity ?? rec.score ?? rec.jaccard_similarity
                return (
                  <div
                    key={song.song_id || i}
                    className="bg-panel border border-border rounded-xl p-4 flex items-center gap-4 card-hover animate-fade-up"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/40 to-neon/20 flex items-center justify-center flex-shrink-0">
                      <Music2 size={16} className="text-accent-bright" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm truncate">{song.titulo || song.song_id}</p>
                      {song.artist_nombre && <p className="text-xs text-text-muted">{song.artist_nombre}</p>}
                      <p className="text-xs text-text-secondary mt-0.5 font-body">{reason}</p>
                    </div>
                    {score != null && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-mono text-neon">{Math.round(Number(score) * 100)}%</div>
                        <div className="text-xs text-text-muted">similitud</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </Section>

      {/* Popular songs */}
      <Section icon={TrendingUp} iconColor="#ff4d6d" title="Canciones populares" loading={popLoading} error={popError} onRetry={loadPopular}>
        {popular.length === 0
          ? <p className="text-sm text-text-muted font-body">Sin datos de popularidad.</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {popular.map((s, i) => (
                <div key={s.song_id || i} className="card-hover bg-panel border border-border rounded-xl p-4">
                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-accent/20 to-neon/10 flex items-center justify-center mb-3">
                    <Music2 size={24} className="text-accent/60" />
                  </div>
                  <p className="font-display font-semibold text-text-primary text-sm truncate">{s.titulo}</p>
                  {s.artist_nombre && <p className="text-xs text-text-muted mt-0.5">{s.artist_nombre}</p>}
                  <div className="flex items-center justify-between mt-2">
                    {s.duracion && <span className="text-xs font-mono text-text-muted">{formatDuration(s.duracion)}</span>}
                    {s.popularidad != null && (
                      <span className="text-xs font-mono text-neon">♥ {s.popularidad}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </Section>

      {/* Genre distribution */}
      <Section icon={BarChart3} iconColor="#f5a623" title="Distribución de géneros" loading={genreLoading} error={genreError} onRetry={loadGenres}>
        {genres.length === 0
          ? <p className="text-sm text-text-muted font-body">Sin datos de géneros.</p>
          : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {genres.map((g, i) => {
                const nombre = g.nombre ?? g.genre ?? g.name ?? String(g)
                const count  = g.count ?? g.total ?? g.cantidad ?? 1
                const maxCount = Math.max(...genres.map(x => x.count ?? x.total ?? 1))
                return (
                  <div key={i} className="card-hover bg-panel border border-border rounded-xl p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-display font-semibold text-text-primary text-sm">{nombre}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-text-secondary">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </Section>

      {/* Similar users */}
      <Section icon={Users} iconColor="#34d399" title="Usuarios similares a ti" loading={simLoading} error={simError} onRetry={loadSimilar}>
        {similar.length === 0
          ? <p className="text-sm text-text-muted font-body">Sin usuarios similares encontrados.</p>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {similar.map((u, i) => {
                const username = u.username ?? u.user_id ?? u.id
                const score = u.similarity ?? u.jaccard_similarity ?? u.score
                return (
                  <div key={i} className="card-hover bg-panel border border-border rounded-xl p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-white">{String(username)[0]?.toUpperCase()}</span>
                    </div>
                    <p className="font-display font-semibold text-text-primary text-sm truncate">@{username}</p>
                    {score != null && (
                      <p className="text-xs text-neon font-mono mt-1">{Math.round(Number(score) * 100)}% similar</p>
                    )}
                    {u.generos_favoritos && (
                      <p className="text-xs text-text-muted mt-1 truncate">{u.generos_favoritos.join(', ')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </Section>

      {/* Artists */}
      <Section icon={Music2} iconColor="#a78bfa" title="Artistas" loading={artLoading}>
        {artists.length === 0
          ? <p className="text-sm text-text-muted font-body">Sin artistas cargados.</p>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {artists.map((a, i) => (
                <div key={a.artist_id || i} className="card-hover bg-panel border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-accent/20 flex items-center justify-center mx-auto mb-2">
                    <Music2 size={20} className="text-purple-300" />
                  </div>
                  <p className="font-display font-semibold text-text-primary text-sm">{a.nombre}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.pais}</p>
                  {a.genero_principal && <Badge color="purple">{a.genero_principal}</Badge>}
                  {a.activo != null && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${a.activo ? 'bg-neon' : 'bg-muted'}`} />
                      <span className="text-xs text-text-muted">{a.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </Section>
    </div>
  )
}

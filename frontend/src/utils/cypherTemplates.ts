export const CYPHER_TEMPLATES = [
  {
    name: 'Usuarios más activos',
    query: `MATCH (u:User)-[r:LISTENED]->()
RETURN u.username, count(r) as escuchas
ORDER BY escuchas DESC LIMIT 10`,
  },
  {
    name: 'Canciones más populares',
    query: `MATCH (s:Song)<-[:LISTENED]-(u:User)
RETURN s.titulo, count(u) as oyentes
ORDER BY oyentes DESC LIMIT 10`,
  },
  {
    name: 'Ranking de influencia',
    query: `MATCH (u:User)<-[:FOLLOWS]-(f:User)
RETURN u.username, count(f) as seguidores
ORDER BY seguidores DESC LIMIT 10`,
  },
  {
    name: 'Usuarios con géneros en común',
    query: `MATCH (u1:User)-[:LIKED]->(g:Genre)<-[:LIKED]-(u2:User)
WHERE u1 <> u2
RETURN u1.username, u2.username, collect(g.nombre) as generos_comunes
LIMIT 20`,
  },
  {
    name: 'Playlists con más canciones',
    query: `MATCH (p:Playlist)-[:CONTAINS]->(s:Song)
RETURN p.nombre, count(s) as total_canciones
ORDER BY total_canciones DESC LIMIT 10`,
  },
  {
    name: 'Nodos aislados',
    query: `MATCH (n)
WHERE NOT (n)--()
RETURN labels(n), n LIMIT 20`,
  },
]

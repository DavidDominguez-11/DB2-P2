export const parseToGraphData = (records) => {
  const nodes = new Map()
  const links = []

  records.forEach(record => {
    const source = record.get('n')
    nodes.set(source.elementId, {
      id: source.elementId,
      label: source.labels[0],
      ...source.properties
    })

    const connections = record.get('connections')
    connections.forEach(conn => {
      const neighbor = conn.neighbor
      const rel = conn.rel
      if (neighbor) {
        nodes.set(neighbor.elementId, {
          id: neighbor.elementId,
          label: neighbor.labels[0],
          ...neighbor.properties
        })
        links.push({
          source: source.elementId,
          target: neighbor.elementId,
          type: rel.type,
          ...rel.properties
        })
      }
    })
  })

  return { nodes: Array.from(nodes.values()), links }
}

export const formatDuration = (minutes) => {
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 100)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const timeAgo = (dateStr) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'hace unos minutos'
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return formatDate(dateStr)
}

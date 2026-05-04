export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('es').format(n)

export const truncate = (str: string, max = 80) =>
  str.length > max ? str.slice(0, max) + '…' : str

import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  keyField?: string
  onRowClick?: (row: T) => void
  pageSize?: number
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  keyField = 'id',
  onRowClick,
  pageSize = 15,
}: Props<T>) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av === bv) return 0
        const cmp = String(av) < String(bv) ? -1 : 1
        return sortAsc ? cmp : -cmp
      })
    : data

  const pages = Math.ceil(sorted.length / pageSize)
  const rows = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
    setPage(0)
  }

  if (loading) return <LoadingSpinner className="py-12" />
  if (!data.length) return <EmptyState />

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-[#252535]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#252535] bg-[#111118]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-[#8888AA] uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-[#F0F0FF]' : ''}`}
                >
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1 text-[#7C6FFF]">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={String(row[keyField] ?? i)}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#252535]/50 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-[#252535]/30' : ''
                } ${i % 2 === 0 ? 'bg-[#16161F]' : 'bg-[#111118]'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[#F0F0FF]">
                    {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-[#8888AA]">
          <span>{data.length} registros</span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border border-[#252535] disabled:opacity-40 hover:border-[#7C6FFF] transition-colors"
            >
              ‹
            </button>
            <span className="px-3 py-1 text-[#F0F0FF]">{page + 1} / {pages}</span>
            <button
              disabled={page >= pages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border border-[#252535] disabled:opacity-40 hover:border-[#7C6FFF] transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

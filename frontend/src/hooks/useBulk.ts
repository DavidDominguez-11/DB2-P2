import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bulkApi } from '../api/bulk.api'

export const useBulkUpdateNodes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bulkApi.updateNodes,
    onSuccess: (d) => {
      qc.invalidateQueries()
      toast.success(`${d.affected ?? '?'} nodos actualizados`)
    },
  })
}

export const useBulkRemoveNodeProperty = () =>
  useMutation({
    mutationFn: bulkApi.removeNodeProperty,
    onSuccess: (d) => toast.success(`Propiedad eliminada en ${d.affected ?? '?'} nodos`),
  })

export const useBulkDeleteNodes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bulkApi.deleteNodes,
    onSuccess: (d) => {
      qc.invalidateQueries()
      toast.success(`${d.affected ?? '?'} nodos eliminados`)
    },
  })
}

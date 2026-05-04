import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { interactionsApi } from '../api/interactions.api'

export const useInteraction = (id: string) =>
  useQuery({ queryKey: ['interactions', id], queryFn: () => interactionsApi.get(id), enabled: !!id })

export const useInteractionsByType = (rel_type: string, limit?: number, enabled = true) =>
  useQuery({
    queryKey: ['interactions-by-type', rel_type, limit],
    queryFn: () => interactionsApi.listByType(rel_type, limit),
    enabled: enabled && !!rel_type,
  })

export const useCreateInteraction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: interactionsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactions'] }); toast.success('Relación creada') },
  })
}

export const useUpdateInteraction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, properties }: { id: string; properties: Record<string, unknown> }) =>
      interactionsApi.update(id, properties),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactions'] }); toast.success('Relación actualizada') },
  })
}

export const useDeleteInteraction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => interactionsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactions'] }); toast.success('Relación eliminada') },
  })
}

export const useBulkUpdateInteractions = () =>
  useMutation({
    mutationFn: interactionsApi.bulkUpdate,
    onSuccess: (d) => toast.success(`${d.affected ?? '?'} relaciones actualizadas`),
  })

export const useBulkDeleteInteractions = () =>
  useMutation({
    mutationFn: interactionsApi.bulkDelete,
    onSuccess: (d) => toast.success(`${d.affected ?? '?'} relaciones eliminadas`),
  })

export const useBulkRemoveRelProperty = () =>
  useMutation({
    mutationFn: interactionsApi.bulkRemoveProperty,
    onSuccess: (d) => toast.success(`Propiedad eliminada en ${d.affected ?? '?'} relaciones`),
  })

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { nodesApi } from '../api/nodes.api'

export const useCreateNode = () =>
  useMutation({
    mutationFn: nodesApi.create,
    onSuccess: () => toast.success('Nodo creado exitosamente'),
  })

export const useNode = (id: string) =>
  useQuery({ queryKey: ['node', id], queryFn: () => nodesApi.get(id), enabled: !!id })

export const useNodeLabels = (id: string) =>
  useQuery({ queryKey: ['node-labels', id], queryFn: () => nodesApi.getLabels(id), enabled: !!id })

export const useUpdateNodeLabels = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: { add: string[]; remove: string[] } }) =>
      nodesApi.updateLabels(id, data),
    onSuccess: () => toast.success('Labels actualizadas'),
  })

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi } from '../api/users.api'

export const useUsers = (params?: { skip?: number; limit?: number; premium?: boolean }) =>
  useQuery({ queryKey: ['users', params], queryFn: () => usersApi.list(params) })

export const useUser = (id: string) =>
  useQuery({ queryKey: ['users', id], queryFn: () => usersApi.get(id), enabled: !!id })

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario creado') },
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario actualizado') },
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario eliminado') },
  })
}

export const useUsersAggregate = (
  params: { group_by: string; agg_field?: string; agg_func?: string },
  enabled = true
) =>
  useQuery({
    queryKey: ['users-agg', params],
    queryFn: () => usersApi.aggregate(params),
    enabled,
  })

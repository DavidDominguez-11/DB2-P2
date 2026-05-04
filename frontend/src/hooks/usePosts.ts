import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postsApi } from '../api/posts.api'

export const usePosts = (params?: { skip?: number; limit?: number }) =>
  useQuery({ queryKey: ['posts', params], queryFn: () => postsApi.list(params) })

export const usePost = (id: string) =>
  useQuery({ queryKey: ['posts', id], queryFn: () => postsApi.get(id), enabled: !!id })

export const useCreatePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Post creado') },
  })
}

export const useUpdatePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => postsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Post actualizado') },
  })
}

export const useDeletePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Post eliminado') },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { genresApi } from '../api/genres.api'

export const useGenres = (params?: { skip?: number; limit?: number }) =>
  useQuery({ queryKey: ['genres', params], queryFn: () => genresApi.list(params) })

export const useGenre = (id: string) =>
  useQuery({ queryKey: ['genres', id], queryFn: () => genresApi.get(id), enabled: !!id })

export const useUpdateGenre = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => genresApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['genres'] }); toast.success('Género actualizado') },
  })
}

export const useCreateGenre = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: genresApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['genres'] }); toast.success('Género creado') },
  })
}

export const useDeleteGenre = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => genresApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['genres'] }); toast.success('Género eliminado') },
  })
}

export const useGenresAggregate = (
  params: { group_by: string; agg_field?: string; agg_func?: string },
  enabled = true
) =>
  useQuery({ queryKey: ['genres-agg', params], queryFn: () => genresApi.aggregate(params), enabled })

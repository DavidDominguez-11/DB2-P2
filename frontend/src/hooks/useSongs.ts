import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { songsApi } from '../api/songs.api'

export const useSongs = (params?: { skip?: number; limit?: number }) =>
  useQuery({ queryKey: ['songs', params], queryFn: () => songsApi.list(params) })

export const useSong = (id: string) =>
  useQuery({ queryKey: ['songs', id], queryFn: () => songsApi.get(id), enabled: !!id })

export const useCreateSong = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['songs'] }); toast.success('Canción creada') },
  })
}

export const useUpdateSong = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => songsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['songs'] }); toast.success('Canción actualizada') },
  })
}

export const useDeleteSong = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => songsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['songs'] }); toast.success('Canción eliminada') },
  })
}

export const useSongsAggregate = (
  params: { group_by: string; agg_field?: string; agg_func?: string },
  enabled = true
) =>
  useQuery({ queryKey: ['songs-agg', params], queryFn: () => songsApi.aggregate(params), enabled })

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { playlistsApi } from '../api/playlists.api'

export const usePlaylists = (params?: { skip?: number; limit?: number }) =>
  useQuery({ queryKey: ['playlists', params], queryFn: () => playlistsApi.list(params) })

export const usePlaylist = (id: string) =>
  useQuery({ queryKey: ['playlists', id], queryFn: () => playlistsApi.get(id), enabled: !!id })

export const useCreatePlaylist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlists'] }); toast.success('Playlist creada') },
  })
}

export const useUpdatePlaylist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => playlistsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlists'] }); toast.success('Playlist actualizada') },
  })
}

export const useDeletePlaylist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => playlistsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlists'] }); toast.success('Playlist eliminada') },
  })
}

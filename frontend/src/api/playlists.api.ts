import api from './client'
import { EP } from './endpoints'

export const playlistsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get(EP.playlists, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.playlist(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.playlists, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.playlist(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.playlistProps(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.playlist(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.playlistsAgg, { params }).then((r) => r.data),
}

import api from './client'
import { EP } from './endpoints'

export const songsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get(EP.songs, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.song(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.songs, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.song(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.songProperties(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.song(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.songsAggregate, { params }).then((r) => r.data),
}

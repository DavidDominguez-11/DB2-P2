import api from './client'
import { EP } from './endpoints'

export const artistsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get(EP.artists, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.artist(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.artists, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.artist(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.artistProps(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.artist(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.artistsAgg, { params }).then((r) => r.data),
}

import api from './client'
import { EP } from './endpoints'

export const genresApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get(EP.genres, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.genre(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.genres, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.genre(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.genreProps(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.genre(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.genresAgg, { params }).then((r) => r.data),
}

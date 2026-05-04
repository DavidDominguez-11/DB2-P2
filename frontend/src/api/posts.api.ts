import api from './client'
import { EP } from './endpoints'

export const postsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get(EP.posts, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.post(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.posts, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.post(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.postProps(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.post(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.postsAgg, { params }).then((r) => r.data),

  feed: (params?: { skip?: number; limit?: number; user_id?: string }) =>
    api.get(`${EP.posts}feed`, { params }).then((r) => r.data),

  followsFeed: (userId: string, limit?: number) =>
    api.get(`${EP.posts}feed/follows/${userId}`, { params: { limit } }).then((r) => r.data),
}

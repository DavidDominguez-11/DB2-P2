import api from './client'
import { EP } from './endpoints'

export const usersApi = {
  list: (params?: { skip?: number; limit?: number; premium?: boolean }) =>
    api.get(EP.users, { params }).then((r) => r.data),

  get: (id: string) => api.get(EP.user(id)).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post(EP.users, data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(EP.user(id), data).then((r) => r.data),

  removeProperties: (id: string, properties: string[]) =>
    api.delete(EP.userProperties(id), { params: { properties }, paramsSerializer: { indexes: null } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.user(id)).then((r) => r.data),

  aggregate: (params: { group_by: string; agg_field?: string; agg_func?: string }) =>
    api.get(EP.usersAggregate, { params }).then((r) => r.data),
}

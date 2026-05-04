import api from './client'
import { EP } from './endpoints'

export interface FilterCondition {
  field: string
  op: string
  value: string
}

export const nodesApi = {
  create: (data: { labels: string[]; properties: Record<string, unknown> }) =>
    api.post(EP.nodes, data).then((r) => r.data),

  get: (id: string) => api.get(EP.nodeById(id)).then((r) => r.data),

  getLabels: (id: string) => api.get(EP.nodeLabels(id)).then((r) => r.data),

  updateLabels: (id: string, data: { add: string[]; remove: string[] }) =>
    api.patch(EP.nodeLabels(id), data).then((r) => r.data),

  search: (
    label: string,
    filters: FilterCondition[],
    skip = 0,
    limit = 25,
  ) => {
    const params: Record<string, unknown> = { label, skip, limit }
    if (filters.length > 0) {
      params['filter_field'] = filters.map((f) => f.field)
      params['filter_op']    = filters.map((f) => f.op)
      params['filter_value'] = filters.map((f) => f.value)
    }
    return api
      .get(`${EP.nodes}/search`, {
        params,
        paramsSerializer: { indexes: null },
      })
      .then((r) => r.data)
  },
}

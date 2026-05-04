import api from './client'
import { EP } from './endpoints'

export const interactionsApi = {
  create: (data: {
    from_label: string
    from_id: string
    to_label: string
    to_id: string
    rel_type: string
    properties?: Record<string, unknown>
  }) => api.post(EP.interactions, data).then((r) => r.data),

  get: (id: string) => api.get(EP.interaction(id)).then((r) => r.data),

  listByType: (rel_type: string, limit?: number) =>
    api.get(EP.interactionsByType, { params: { rel_type, limit } }).then((r) => r.data),

  update: (id: string, properties: Record<string, unknown>) =>
    api.patch(EP.interaction(id), { properties }).then((r) => r.data),

  removeProperties: (id: string, property_names: string[]) =>
    api.delete(EP.interactionProps(id), { data: { property_names } }).then((r) => r.data),

  delete: (id: string) => api.delete(EP.interaction(id)).then((r) => r.data),

  bulkUpdate: (data: {
    rel_type: string
    filter_property: string
    filter_value: unknown
    update_data: Record<string, unknown>
  }) => api.patch(EP.bulkRelUpdate, data).then((r) => r.data),

  bulkRemoveProperty: (data: {
    rel_type: string
    property_to_remove: string
    filter_property?: string
    filter_value?: unknown
  }) => api.delete(EP.bulkRelRemoveProps, { data }).then((r) => r.data),

  bulkDelete: (data: {
    rel_type: string
    filter_property: string
    filter_value: unknown
  }) => api.delete(EP.bulkRelDelete, { data }).then((r) => r.data),
}

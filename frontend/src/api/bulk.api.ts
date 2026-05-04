import api from './client'
import { EP } from './endpoints'

export const bulkApi = {
  updateNodes: (data: {
    label: string
    filter_property: string
    filter_value: unknown
    update_data: Record<string, unknown>
  }) => api.patch(EP.bulkNodes, data).then((r) => r.data),

  removeNodeProperty: (data: {
    label: string
    property_to_remove: string
    filter_property?: string
    filter_value?: unknown
  }) => api.delete(EP.bulkNodeProps, { data }).then((r) => r.data),

  deleteNodes: (data: {
    label: string
    filter_property: string
    filter_value: unknown
  }) => api.delete(EP.bulkNodes, { data }).then((r) => r.data),

  maintenanceStats: () => api.get(EP.maintenanceStats).then((r) => r.data),
}

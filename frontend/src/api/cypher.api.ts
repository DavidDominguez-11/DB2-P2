import api from './client'
import { EP } from './endpoints'

export const cypherApi = {
  query: (query: string) =>
    api.post(EP.cypherQuery, { query }).then((r) => r.data),
}

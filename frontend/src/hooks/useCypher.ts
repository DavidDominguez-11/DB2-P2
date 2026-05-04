import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cypherApi } from '../api/cypher.api'
import { useQueryHistoryStore } from '../store/queryHistoryStore'

export const useCypherQuery = () => {
  const addQuery = useQueryHistoryStore((s) => s.addQuery)
  return useMutation({
    mutationFn: (query: string) => cypherApi.query(query),
    onSuccess: (_, query) => { addQuery(query, true) },
    onError: (_, query) => { addQuery(query, false); toast.error('Error al ejecutar query') },
  })
}

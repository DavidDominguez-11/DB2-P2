import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HistoryEntry {
  query: string
  timestamp: string
  success: boolean
}

interface QueryHistoryStore {
  history: HistoryEntry[]
  addQuery: (q: string, success: boolean) => void
  clearHistory: () => void
}

export const useQueryHistoryStore = create<QueryHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addQuery: (query, success) =>
        set((s) => ({
          history: [
            { query, timestamp: new Date().toISOString(), success },
            ...s.history.slice(0, 49),
          ],
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'cypher-history' }
  )
)

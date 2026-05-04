import { create } from 'zustand'

interface GraphStore {
  selectedNodeId: string | null
  selectedNodeType: string | null
  selectedRelId: string | null
  setSelectedNode: (id: string, type: string) => void
  setSelectedRel: (id: string) => void
  clearSelection: () => void
}

export const useGraphStore = create<GraphStore>((set) => ({
  selectedNodeId: null,
  selectedNodeType: null,
  selectedRelId: null,
  setSelectedNode: (id, type) => set({ selectedNodeId: id, selectedNodeType: type }),
  setSelectedRel: (id) => set({ selectedRelId: id }),
  clearSelection: () => set({ selectedNodeId: null, selectedNodeType: null, selectedRelId: null }),
}))

export interface Neo4jNode {
  id: string
  labels: string[]
  properties: Record<string, unknown>
}

export interface Neo4jRelationship {
  id: string
  type: string
  startNodeId: string
  endNodeId: string
  properties: Record<string, unknown>
}

export const NODE_LABELS = ['User', 'Artist', 'Song', 'Playlist', 'Post', 'Genre', 'Influencer', 'Moderator', 'Label'] as const
export type NodeLabel = (typeof NODE_LABELS)[number]

export interface PropertyField {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'date'
}

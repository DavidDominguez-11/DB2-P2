import api from './client'
import { EP } from './endpoints'

export const analyticsApi = {
  recommendations: (userId: string, limit?: number) =>
    api.get(EP.analyticsRecs(userId), { params: { limit } }).then((r) => r.data),

  similarUsers: (userId: string, limit?: number) =>
    api.get(EP.analyticsSimilar(userId), { params: { limit } }).then((r) => r.data),

  influence: (limit?: number) =>
    api.get(EP.analyticsInfluence, { params: { limit } }).then((r) => r.data),

  popularSongs: (limit?: number) =>
    api.get(EP.analyticsPopularSongs, { params: { limit } }).then((r) => r.data),

  genreDistribution: () =>
    api.get(EP.analyticsGenreDistribution).then((r) => r.data),

  userActivity: (userId: string) =>
    api.get(EP.analyticsUserActivity(userId)).then((r) => r.data),
}

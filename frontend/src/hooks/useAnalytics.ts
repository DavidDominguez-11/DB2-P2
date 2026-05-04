import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.api'

export const useRecommendations = (userId: string, limit?: number) =>
  useQuery({
    queryKey: ['analytics-recs', userId, limit],
    queryFn: () => analyticsApi.recommendations(userId, limit),
    enabled: !!userId,
  })

export const useSimilarUsers = (userId: string, limit?: number) =>
  useQuery({
    queryKey: ['analytics-similar', userId, limit],
    queryFn: () => analyticsApi.similarUsers(userId, limit),
    enabled: !!userId,
  })

export const useInfluenceRanking = (limit?: number) =>
  useQuery({
    queryKey: ['analytics-influence', limit],
    queryFn: () => analyticsApi.influence(limit),
  })

export const usePopularSongs = (limit?: number) =>
  useQuery({
    queryKey: ['analytics-popular', limit],
    queryFn: () => analyticsApi.popularSongs(limit),
  })

export const useGenreDistribution = () =>
  useQuery({
    queryKey: ['analytics-genres'],
    queryFn: () => analyticsApi.genreDistribution(),
  })

export const useUserActivity = (userId: string) =>
  useQuery({
    queryKey: ['analytics-activity', userId],
    queryFn: () => analyticsApi.userActivity(userId),
    enabled: !!userId,
  })

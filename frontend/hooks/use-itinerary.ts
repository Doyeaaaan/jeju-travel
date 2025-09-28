/**
 * 여행 일정 관련 커스텀 훅 (실제 백엔드 API에 맞춤)
 * 기존 프로젝트 패턴에 맞춰 useState + useEffect 사용
 */

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/client'
import { ENDPOINTS } from '@/lib/endpoints'
import type { MyTripPlan, FriendResponse, TripPlanShareRequest, TripPlanShareResponse, SharedPlan } from '@/types/api-types'

/**
 * 내 여행 계획 목록 조회 훅
 * API: GET /api/trip-plans/my-plans
 * Response: List<TripPlanDto> (직접 배열 반환)
 */
export function useMyTripPlans() {
  const [data, setData] = useState<MyTripPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTripPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiGet<MyTripPlan[]>(ENDPOINTS.myTripPlans)
      setData(response || [])
    } catch (err: any) {
      setError(err.message || '여행 계획 목록을 불러오는데 실패했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTripPlans()
  }, [fetchTripPlans])

  return {
    data,
    loading,
    error,
    refetch: fetchTripPlans,
  }
}

/**
 * 친구 목록 조회 훅
 * API: GET /api/friend
 * Response: ApiResponse<List<FriendResponseDto>>
 */
export function useMyFriends() {
  const [data, setData] = useState<FriendResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiGet<FriendResponse[]>(ENDPOINTS.friends)
      setData(response || [])
    } catch (err: any) {
      setError(err.message || '친구 목록을 불러오는데 실패했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  return {
    data,
    loading,
    error,
    refetch: fetchFriends,
  }
}

/**
 * 여행 계획 복제 공유 훅 (다중 친구 동시 공유)
 * API: POST /api/trip-plans/{planId}/share
 * Body: { "friendIds": [1, 2, 3] }
 */
export function useShareTripPlan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareTripPlan = useCallback(async (args: { planId: number; friendIds: number[] }) => {
    try {
      setLoading(true)
      setError(null)
      
      const { planId, friendIds } = args
      const requestBody: TripPlanShareRequest = { friendIds }
        url: ENDPOINTS.shareClone(planId),
        method: 'POST',
        body: requestBody,
        bodyStringified: JSON.stringify(requestBody)
      })
      
      // 백엔드 스펙: POST /api/trip-plans/{planId}/share
      // Body: { "friendIds": [1, 2, 3] }
      // Response: ApiResponse<TripPlanShareCloneResponse>
      const response = await apiPost<TripPlanShareResponse>(
        ENDPOINTS.shareClone(planId), 
        requestBody
      )
      
      return response
    } catch (err: any) {
        status: err.status,
        message: err.message,
        response: err.response,
        stack: err.stack
      })
      const errorMessage = err.message || '여행 계획 공유에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const shareTripPlanAsync = useCallback(async (args: { planId: number; friendIds: number[] }) => {
    return shareTripPlan(args)
  }, [shareTripPlan])

  return {
    shareTripPlan,
    shareTripPlanAsync,
    loading,
    error,
  }
}

/**
 * 공유된 일정 목록 조회 훅
 * API: GET /api/plan/shared
 * Response: ApiResponse<List<PlanShareResponseDto>>
 */
export function useSharedPlans() {
  const [data, setData] = useState<SharedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSharedPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiGet<SharedPlan[]>(ENDPOINTS.sharedPlans)
      
      setData(response || [])
    } catch (err: any) {
      setError(err.message || '공유된 일정 목록을 불러오는데 실패했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSharedPlans()
  }, [fetchSharedPlans])

  return {
    data,
    loading,
    error,
    refetch: fetchSharedPlans,
  }
}

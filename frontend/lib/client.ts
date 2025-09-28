/**
 * API 클라이언트 래퍼 함수들
 * 기존 ApiClient를 재사용하면서 새로운 엔드포인트에 대한 간편한 래퍼 제공
 */

import { apiClient } from './api-client'

/**
 * 프로젝트 공통 인증 헤더 사용
 */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET 요청 래퍼
 */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path, true)
  // ApiResponse<T> 형태에서 data 추출하거나 전체 반환
  return (response?.data ?? response) as T
}

/**
 * POST 요청 래퍼
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<T>(path, body, true)
  // ApiResponse<T> 형태에서 data 추출하거나 전체 반환
  return (response?.data ?? response) as T
}

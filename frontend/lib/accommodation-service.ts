import { apiClient } from "./api-client"

// 프로덕션 환경에서 콘솔 로그 비활성화
const isDev = process.env.NODE_ENV === 'development'
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

// 날짜 포맷팅 유틸리티 함수
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 기본 체크인/체크아웃 날짜 가져오기
function getDefaultDates() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow)
  }
}

export const accommodationService = {
  async searchPlaces(
    region: string,
    checkIn: string = getDefaultDates().checkIn,
    checkOut: string = getDefaultDates().checkOut,
    personal: number = 2,
    limit: number = 100
  ) {
    try {
      const queryParams = new URLSearchParams({
        region: encodeURIComponent(region),
        checkIn,
        checkOut,
        personal: personal.toString(),
        limit: limit.toString()
      })

      const result = await apiClient.get(`/yeogi/places?${queryParams.toString()}`)

      if (!result) {
        return []
      }

      if (!result.status?.startsWith("200")) {
        return []
      }

      if (result.data && Array.isArray(result.data)) {
        return result.data
      } else {
        return []
      }
    } catch (error) {
      return []
    }
  },



  async searchRooms(
    placeId: string,
    checkIn: string = getDefaultDates().checkIn,
    checkOut: string = getDefaultDates().checkOut,
    personal: number = 2
  ) {
    try {
      const queryParams = new URLSearchParams({
        checkIn,
        checkOut,
        personal: personal.toString()
      })

      const result = await apiClient.get(`/yeogi/rooms/${placeId}?${queryParams.toString()}`)

      if (!result) {
        return []
      }

      if (!result.status?.startsWith("200")) {
        return []
      }

      if (result.data && Array.isArray(result.data)) {
        return result.data
      } else {
        return []
      }
    } catch (error) {
      return []
    }
  }
}

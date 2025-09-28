"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Calendar, Clock, Edit, MapPin, Loader2 } from "lucide-react"
import { tripService } from "@/lib/trip-service"
import { placeNameService } from "@/lib/place-name-service"
import type { TripPlanDto, TripDayWithDestinationsDto, DestinationDto } from "@/types/api-types"

// placeId 번호에 따른 실제 제주도 지명 반환 함수
const getPlaceNameById = (placeIdNum: number, type: string): string => {
  const placeNames: Record<string, Record<number, string>> = {
    attraction: {
      0: "성산일출봉",
      1: "협재해수욕장",
      2: "한라산 국립공원",
      3: "만장굴",
      4: "천지연폭포",
      5: "우도",
      6: "중문관광단지",
      7: "제주올레길",
      8: "테디베어뮤지엄",
      9: "제주민속촌",
      10: "성읍민속마을",
      11: "용머리해안",
      12: "정방폭포",
      13: "한라수목원",
      14: "제주도립미술관",
      15: "제주현대미술관",
      16: "제주4.3평화공원",
      17: "제주도립도서관",
      18: "제주대학교",
      19: "제주국제공항"
    },
    restaurant: {
      0: "제주 흑돼지 맛집",
      1: "해녀의 집",
      2: "제주 해산물 맛집",
      3: "갈치조림 맛집",
      4: "제주 감귤 맛집",
      5: "제주 한라봉 맛집",
      6: "제주 말고기 맛집",
      7: "제주 전통 맛집",
      8: "제주 바다 맛집",
      9: "제주 산채 맛집",
      10: "제주 갈치 맛집",
      11: "제주 전복 맛집",
      12: "제주 고등어 맛집",
      13: "제주 멍게 맛집",
      14: "제주 성게 맛집",
      15: "제주 바닷가재 맛집",
      16: "제주 꽃게 맛집",
      17: "제주 대게 맛집",
      18: "제주 새우 맛집",
      19: "제주 문어 맛집"
    },
    accommodation: {
      0: "제주 리조트",
      1: "제주 펜션",
      2: "제주 호텔",
      3: "제주 게스트하우스",
      4: "제주 민박",
      5: "제주 바다뷰 펜션",
      6: "제주 산뷰 펜션",
      7: "제주 전통 한옥",
      8: "제주 캠핑장",
      9: "제주 글램핑",
      10: "제주 비치호텔",
      11: "제주 스파리조트",
      12: "제주 골프리조트",
      13: "제주 힐링펜션",
      14: "제주 로맨틱펜션",
      15: "제주 가족펜션",
      16: "제주 친구펜션",
      17: "제주 혼자펜션",
      18: "제주 커플펜션",
      19: "제주 그룹펜션"
    }
  }
  
  return placeNames[type]?.[placeIdNum] || `${type} ${placeIdNum}`
}

interface PlanDetailModalProps {
  trip: TripPlanDto | null
  isOpen: boolean
  onClose: () => void
}

export default function PlanDetailModal({ trip, isOpen, onClose }: PlanDetailModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tripDays, setTripDays] = useState<TripDayWithDestinationsDto[]>([])
  const [placeNames, setPlaceNames] = useState<Record<string, string>>({})
  const [loadingPlaceNames, setLoadingPlaceNames] = useState(false)

  useEffect(() => {
    if (isOpen && trip) {
      loadPlanDetails()
    }
  }, [isOpen, trip])

  const loadPlanDetails = async () => {
    if (!trip) return

    setLoading(true)
    try {
      const planId = trip.id || (trip as any).tripPlanId
      
      if (!planId) {
        setTripDays([])
        return
      }

      // GET /api/trip-plans/{planId}/days-with-dests 호출
      const response = await tripService.getPlanDays(planId)

      if (!response?.data || !Array.isArray(response.data)) {
        setTripDays([])
        return
      }

      // 각 day의 destinations를 sequence ASC로 정렬
      const sortedDays = response.data.map((day) => ({
        ...day,
        destinations: [...(day.destinations || [])].sort((a, b) => a.sequence - b.sequence),
      }))

      setTripDays(sortedDays)

      // 🔍 디버깅: 각 날의 일정 상세 로그
      const totalDestinations = sortedDays.reduce((sum, day) => sum + (day.destinations?.length || 0), 0)

      sortedDays.forEach((day, index) => {
          tripDayId: day.tripDayId,
          dayNumber: day.dayNumber,
          destinationsCount: day.destinations?.length || 0,
          destinations: day.destinations,
        })
      })

      // 모든 placeId 수집하여 장소명 해석
      const allDestinations = sortedDays.flatMap((day) =>
        day.destinations.map((dest) => ({
          id: dest.id,
          placeId: dest.placeId,
          type: dest.type,
        })),
      )

      if (allDestinations.length > 0) {
        setLoadingPlaceNames(true)
        try {
          const placeNameMap = await placeNameService.resolvePlaceNames(allDestinations)
          setPlaceNames(placeNameMap)
        } catch (error) {
          // 장소명 해석 실패 시 기본값 설정 (실제 지명 사용)
          const fallbackNames: Record<string, string> = {}
          allDestinations.forEach((dest) => {
            // placeId가 "place_5" 형태이거나 그냥 숫자인 경우 모두 처리
            let placeIdNum = 0
            if (dest.placeId.includes('place_')) {
              placeIdNum = parseInt(dest.placeId.replace('place_', '')) || 0
            } else {
              placeIdNum = parseInt(dest.placeId) || 0
            }
            fallbackNames[dest.placeId] = getPlaceNameById(placeIdNum, dest.type)
          })
          setPlaceNames(fallbackNames)
        } finally {
          setLoadingPlaceNames(false)
        }
      }
    } catch (error: any) {
      setTripDays([])
      setPlaceNames({})
    } finally {
      setLoading(false)
    }
  }

  // 수정하기 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (!trip) {
      return
    }

    const planId = trip.id || (trip as any).tripPlanId
    if (!planId) {
      return
    }


    // 모달 닫기
    onClose()

    // 편집 화면으로 이동
    router.push(`/planning/flow/itinerary-confirmation?tripPlanId=${planId}`)
  }

  const refreshPlanDetails = async () => {
    await loadPlanDetails()
  }

  const formatDate = (dateString: string) => {
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const datePart = dateString.split('T')[0] // "2024-09-19T00:00:00" -> "2024-09-19"
      const [year, month, day] = datePart.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month는 0부터 시작하므로 -1
      const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
      const weekday = weekdays[date.getDay()]
      return `${month}월 ${day}일 (${weekday})`
    } catch (e) {
      return dateString
    }
  }

  const getTripDuration = (startDate: string, endDate: string) => {
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const startPart = startDate.split('T')[0]
      const endPart = endDate.split('T')[0]
      const [startYear, startMonth, startDay] = startPart.split('-').map(Number)
      const [endYear, endMonth, endDay] = endPart.split('-').map(Number)
      
      const start = new Date(startYear, startMonth - 1, startDay)
      const end = new Date(endYear, endMonth - 1, endDay)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays + 1
    } catch (e) {
      return 1
    }
  }

  const renderDestination = (destination: DestinationDto) => {
    const typeLabels = {
      accommodation: "숙소",
      attraction: "관광지",
      restaurant: "식당",
    }

    // 백엔드에서 저장된 실제 장소명을 우선 사용
    const placeName = destination.placeName || 
      (loadingPlaceNames
        ? "장소명 조회 중..."
        : placeNames[destination.placeId] ||
          `${typeLabels[destination.type as keyof typeof typeLabels] || destination.type} (ID: ${destination.placeId})`)

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          <MapPin size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {typeLabels[destination.type as keyof typeof typeLabels] || destination.type}
            </span>
            <span className="text-sm font-medium text-gray-900">{placeName}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen || !trip) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{trip.planName}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{getTripDuration(trip.startDate, trip.endDate)}일 여행</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditClick}
                disabled={!trip || (!trip.id && !(trip as any).tripPlanId)}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#FF8650] text-white hover:bg-[#FF8650]/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Edit size={16} className="inline mr-2" />
                수정하기
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">일정을 불러오는 중...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {tripDays.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">아직 일정이 없습니다.</p>
                  <button
                    onClick={loadPlanDetails}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 불러오기
                  </button>
                </div>
              ) : (
                tripDays
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((day) => {
                    // 각 day의 destinations는 이미 sequence ASC로 정렬됨
                    const destinations = day.destinations || []

                    return (
                      <div key={day.tripDayId} className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {day.dayNumber}일차 · {formatDate(day.date)}
                          </h3>
                        </div>

                        {destinations.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">이 날은 일정이 없습니다</p>
                            <p className="text-xs text-gray-400 mt-2">
                              tripDayId: {day.tripDayId} | dayNumber: {day.dayNumber}
                            </p>
                            <button
                              onClick={loadPlanDetails}
                              className="mt-3 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                            >
                              🔄 새로고침
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {destinations.map((destination, index) => (
                              <div key={destination.id} className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">{renderDestination(destination)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

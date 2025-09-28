"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, MapPin, ClockIcon, Save, Share2, Plus, Trash, Edit, Hotel } from "lucide-react"
import KakaoMap from "@/components/KakaoMap"
import { tripService } from "@/lib/trip-service"
import { authService } from "@/lib/auth-service"
import { attractionService } from "@/lib/attraction-service"
import { accommodationService } from "@/lib/accommodation-service"
import type { TripPlanDto, TripDayWithDestinationsDto } from "@/types/api-types"

export default function ItineraryConfirmationPage() {
  const router = useRouter()
  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlanDto | null>(null)
  const [tripDays, setTripDays] = useState<TripDayWithDestinationsDto[]>([])
  const [activeDay, setActiveDay] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [placeDetails, setPlaceDetails] = useState<Record<string, any>>({})
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverItem(index)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // activeDay로부터 안전하게 dayId 추출 (tripDayId 통일)
    const currentDay = tripDays?.find(d => d.dayNumber === activeDay)
    if (!currentDay) {
      return
    }

    // TripDay 식별자를 tripDayId로 통일
    const dayId = currentDay.tripDayId
    if (!dayId) {
      return
    }

    try {
      // 1단계: 재정렬 직전 최신 목록으로 동기화
      if (!currentTripPlan?.id) return
      
      const latestDayResponse = await tripService.getTripDaysWithDestinations(currentTripPlan.id)
      const latestDay = latestDayResponse.data.find(d => d.tripDayId === dayId)
      
      if (!latestDay) {
        throw new Error("최신 날짜 정보를 찾을 수 없습니다.")
      }

      // 2단계: 최신 목적지들을 sequence 순으로 정렬
      const sorted = [...latestDay.destinations].sort((a, b) => a.sequence - b.sequence)

      // 3단계: 드래그된 아이템을 이동
      const moving = sorted[draggedItem]
      const arr = [...sorted]
      arr.splice(draggedItem, 1)
      arr.splice(dropIndex, 0, moving)

      // 4단계: 해당 날의 모든 목적지 ID를 순서대로 보냄 (전체 배열 보장)
      const orderedIds = arr.map((d) => d.id)
      
      // 가드: 집합 동일성 검증
      const serverIds = sorted.map(d => d.id)
      const serverIdsSorted = serverIds.slice().sort((a, b) => a - b)
      const clientIdsSorted = orderedIds.slice().sort((a, b) => a - b)
      
      if (JSON.stringify(serverIdsSorted) !== JSON.stringify(clientIdsSorted)) {
        alert("다른 기기에서 일정이 변경되었습니다. 새로고침 후 다시 시도하세요.")
        await loadTripPlan(currentTripPlan.id)
        return
      }

      // 5단계: 한 번에 순서 변경 요청
      const response = await tripService.updateDestinationSequence(dayId, orderedIds)
      
      // 6단계: 서버 응답으로 상태 업데이트 (항상 sequence ASC)
      if (response?.data) {
        setTripDays(prev => prev.map(d => 
          d.tripDayId === dayId 
            ? { ...response.data, tripDayId: response.data.tripDayId || (response.data as any).id } 
            : d
        ))
      } else {
        // 서버 응답이 없어도 로컬 상태는 업데이트 (UI 갱신을 위해)
        setTripDays(prev => prev.map(d => 
          d.tripDayId === dayId 
            ? { ...d, destinations: arr } // 재정렬된 배열로 업데이트
            : d
        ))
      }
    } catch (error: any) {
      // 409 CONFLICT (SEQ001) 에러인 경우 자동 재시도
      if (error?.response?.status === 409 && error?.response?.data?.code === "SEQ001") {
        alert("다른 기기/탭에서 순서가 바뀌었습니다. 새로고침 후 다시 시도하세요.")
      } else {
        alert(`순서 변경에 실패했습니다: ${error?.response?.data?.message || error.message || error}`)
      }
      
      // 실패 시 원래 상태로 롤백 (서버에서 다시 로드)
      if (currentTripPlan) {
        await loadTripPlan(currentTripPlan.id)
      }
    } finally {
      setDraggedItem(null)
      setDragOverItem(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // 드롭다운으로 순서 변경
  const handleSequenceChange = async (destinationId: number, newSequence: number) => {
    // activeDay로부터 안전하게 dayId 추출 (tripDayId 통일)
    const currentDay = tripDays?.find(d => d.dayNumber === activeDay)
    if (!currentDay) {
      return
    }

    // TripDay 식별자를 tripDayId로 통일
    const dayId = currentDay.tripDayId
    if (!dayId) {
      return
    }

    try {
      // 1단계: 재정렬 직전 최신 목록으로 동기화
      if (!currentTripPlan?.id) return
      
      const latestDayResponse = await tripService.getTripDaysWithDestinations(currentTripPlan.id)
      const latestDay = latestDayResponse.data.find(d => d.tripDayId === dayId)
      
      if (!latestDay) {
        throw new Error("최신 날짜 정보를 찾을 수 없습니다.")
      }

      // 2단계: 최신 목적지들을 sequence 순으로 정렬
      const sorted = [...latestDay.destinations].sort((a, b) => a.sequence - b.sequence)
      
      // 3단계: 변경할 목적지 찾기
      const targetIndex = sorted.findIndex(d => d.id === destinationId)
      if (targetIndex === -1) return
      
      // 4단계: 새로운 위치로 이동
      const moving = sorted[targetIndex]
      const arr = [...sorted]
      arr.splice(targetIndex, 1)
      arr.splice(newSequence - 1, 0, moving)
      
      // 5단계: 해당 날의 모든 목적지 ID를 순서대로 보냄 (전체 배열 보장)
      const orderedIds = arr.map((d) => d.id)

      // 가드: 집합 동일성 검증
      const serverIds = sorted.map(d => d.id)
      const serverIdsSorted = serverIds.slice().sort((a, b) => a - b)
      const clientIdsSorted = orderedIds.slice().sort((a, b) => a - b)

      if (JSON.stringify(serverIdsSorted) !== JSON.stringify(clientIdsSorted)) {
        alert("다른 기기에서 일정이 변경되었습니다. 새로고침 후 다시 시도하세요.")
        await loadTripPlan(currentTripPlan.id)
        return
      }

      // 6단계: 한 번에 순서 변경 요청
      const response = await tripService.updateDestinationSequence(dayId, orderedIds)
      
      // 7단계: 서버 응답으로 상태 업데이트
      if (response?.data) {
        setTripDays(prev => prev.map(d => 
          d.tripDayId === dayId 
            ? { ...response.data, tripDayId: response.data.tripDayId || (response.data as any).id } 
            : d
        ))
      } else {
        // 서버 응답이 없어도 로컬 상태는 업데이트 (UI 갱신을 위해)
        setTripDays(prev => prev.map(d => 
          d.tripDayId === dayId 
            ? { ...d, destinations: arr } // 재정렬된 배열로 업데이트
            : d
        ))
      }
    } catch (error: any) {
      alert(`순서 변경에 실패했습니다: ${error.message || error}`)
      // 실패 시 원래 상태로 롤백
      if (currentTripPlan) {
        await loadTripPlan(currentTripPlan.id)
      }
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tripPlanId = urlParams.get("tripPlanId")

    if (!tripPlanId) {
      alert("여행 계획 정보가 없습니다. 처음부터 다시 시작해주세요.")
      router.push("/planning/flow/date-selection")
      return
    }

    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    loadTripPlan(Number(tripPlanId))
  }, [])

  // activeDay 변경 시 해당 날짜의 최신 데이터 재조회 (tripDayId 통일)
  useEffect(() => {
    if (!currentTripPlan?.id || !tripDays.length) return

    const refreshActiveDay = async () => {
      try {
        const currentDay = tripDays?.find(d => d.dayNumber === activeDay)
        const dayId = currentDay?.tripDayId
        if (!dayId) return

        const latestDayResponse = await tripService.getTripDaysWithDestinations(currentTripPlan.id)
        
        if (latestDayResponse?.data) {
          const latestDay = latestDayResponse.data.find(d => d.tripDayId === dayId)
          
          if (latestDay && currentDay) {
            // 해당 날짜의 데이터만 업데이트 (tripDayId 통일)
            setTripDays(prev => prev.map(d => 
              d.tripDayId === dayId ? { ...latestDay, tripDayId: latestDay.tripDayId || (latestDay as any).id } : d
            ))
          }
        }
      } catch (error) {
        // 에러 처리
      }
    }

    refreshActiveDay()
  }, [activeDay, currentTripPlan?.id])

  const loadTripPlan = async (planId: number) => {
    try {
      setLoading(true)

      const planResponse = await tripService.getTripPlan(planId)

      if (planResponse?.data) {
        setCurrentTripPlan(planResponse.data)
      } else {
        throw new Error("여행 계획 데이터를 찾을 수 없습니다.")
      }

      const daysResponse = await tripService.getTripDaysWithDestinations(planId)

      if (daysResponse?.data && Array.isArray(daysResponse.data)) {
        // tripDayId 필드 보장 및 정규화
        const normalizedDays = daysResponse.data.map(day => ({
          ...day,
          tripDayId: day.tripDayId || (day as any).id,
          destinations: [...day.destinations].sort((a, b) => a.sequence - b.sequence) // 항상 sequence ASC
        }))
        
        setTripDays(normalizedDays)
        await loadPlaceDetails(normalizedDays)
      } else {
        setTripDays([])
      }
    } catch (error) {
      alert(`여행 계획을 불러오는데 실패했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadPlaceDetails = async (days: TripDayWithDestinationsDto[]) => {
    const placeIds = new Set<string>()

    days.forEach((day) => {
      day.destinations.forEach((dest) => {
        if (dest.placeId) {
          placeIds.add(dest.placeId)
        }
      })
    })

    const placeDetailsMap: Record<string, any> = {}

    try {
      const attractions = await attractionService.getAttractions(1, 100)

      for (const placeId of placeIds) {
        try {
          let placeInfo = attractions.find(
            (place: any) =>
              place.id === placeId ||
              place.placeId === placeId ||
              place.contentId === placeId ||
              place.attractionId === placeId,
          )

          if (placeInfo) {
            placeDetailsMap[placeId] = {
              name: placeInfo.name || placeInfo.title || `장소 ID: ${placeId}`,
              imageUrl:
                placeInfo.imageUrl ||
                placeInfo.image ||
                placeInfo.img ||
                "/placeholder.svg?height=80&width=80&text=이미지 없음",
              latitude: placeInfo.latitude || placeInfo.lat || placeInfo.mapY,
              longitude: placeInfo.longitude || placeInfo.lng || placeInfo.mapX,
            }
            continue
          }

          try {
            const accommodations = await accommodationService.searchPlaces("제주", "2025-01-01", "2025-01-02", 2, 100)
            placeInfo = accommodations.find(
              (place: any) =>
                place.id === placeId ||
                place.placeId === placeId ||
                place.contentId === placeId ||
                place.accommodationId === placeId ||
                String(place.id) === placeId ||
                String(place.placeId) === placeId ||
                String(place.contentId) === placeId,
            )

            if (placeInfo) {
              placeDetailsMap[placeId] = {
                name:
                  placeInfo.name ||
                  placeInfo.title ||
                  placeInfo.accommodationName ||
                  placeInfo.placeName ||
                  `장소 ID: ${placeId}`,
                imageUrl:
                  placeInfo.imageUrl ||
                  placeInfo.image ||
                  placeInfo.img ||
                  placeInfo.accommodationImage ||
                  placeInfo.placeImage ||
                  "/placeholder.svg?height=80&width=80&text=이미지 없음",
                latitude: placeInfo.latitude || placeInfo.lat || placeInfo.mapY,
                longitude: placeInfo.longitude || placeInfo.lng || placeInfo.mapX,
              }
              continue
            }
          } catch (error) {
            // 숙소 정보 로드 실패
          }

          placeDetailsMap[placeId] = {
            name: `숙박 장소 (ID: ${placeId})`,
            imageUrl: "/placeholder.svg?height=80&width=80&text=정보 없음",
          }
        } catch (error) {
          placeDetailsMap[placeId] = {
            name: `장소 ID: ${placeId}`,
            imageUrl: "/placeholder.svg?height=80&width=80&text=오류",
          }
        }
      }

      setPlaceDetails(placeDetailsMap)
    } catch (error) {
      const defaultPlaceDetails: Record<string, any> = {}
      placeIds.forEach((placeId) => {
        defaultPlaceDetails[placeId] = {
          name: `장소 ID: ${placeId}`,
          imageUrl: "/placeholder.svg?height=80&width=80&text=로드 실패",
        }
      })
      setPlaceDetails(defaultPlaceDetails)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const datePart = dateString.split('T')[0] // "2024-09-19T00:00:00" -> "2024-09-19"
      const [year, month, day] = datePart.split('-').map(Number)
      return `${month}월 ${day}일`
    } catch (e) {
      return dateString
    }
  }

  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return ""
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const datePart = dateString.split('T')[0] // "2024-09-19T00:00:00" -> "2024-09-19"
      const [year, month, day] = datePart.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month는 0부터 시작하므로 -1
      const days = ["일", "월", "화", "수", "목", "금", "토"]
      return days[date.getDay()]
    } catch (e) {
      return ""
    }
  }

  const getTripDuration = () => {
    if (!currentTripPlan) return 0
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const startPart = currentTripPlan.startDate.split('T')[0]
      const endPart = currentTripPlan.endDate.split('T')[0]
      const [startYear, startMonth, startDay] = startPart.split('-').map(Number)
      const [endYear, endMonth, endDay] = endPart.split('-').map(Number)
      
      const start = new Date(startYear, startMonth - 1, startDay)
      const end = new Date(endYear, endMonth - 1, endDay)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } catch (e) {
      return 1
    }
  }

  const removeDestination = async (dayId: number, destId: number) => {
    if (!editMode) return

    try {
      await tripService.removeDestination(dayId, destId)
      if (currentTripPlan) {
        await loadTripPlan(currentTripPlan.id)
      }
    } catch (error) {
      alert("목적지 삭제에 실패했습니다.")
    }
  }

  const handleSaveItinerary = async () => {
    try {
      alert("여행 일정이 저장되었습니다!")
      router.push("/my-itinerary")
    } catch (error) {
      alert("일정 저장에 실패했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-600">여행 계획을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (!currentTripPlan && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">여행 계획을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">
            여행 계획 ID: {new URLSearchParams(window.location.search).get("tripPlanId")}
          </p>
          <p className="text-gray-600 mb-8">데이터 로딩에 문제가 있을 수 있습니다.</p>
          <div className="space-y-4">
            <button
              onClick={() => {
                const tripPlanId = new URLSearchParams(window.location.search).get("tripPlanId")
                if (tripPlanId) {
                  loadTripPlan(Number(tripPlanId))
                }
              }}
              className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors mr-4"
            >
              다시 시도
            </button>
            <Link
              href="/planning/flow/date-selection"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              새 여행 계획하기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalDays = getTripDuration()

  return (
    <div className="max-w-full mx-auto bg-white min-h-screen flex">
      <div className="w-2/3 border-r">
        <div className="p-4 border-b flex items-center">
          <Link href="/" className="mr-4">
            <div className="text-xl font-bold">재곰제곰</div>
          </Link>
          <div className="text-lg font-medium ml-4">여행 계획 세우기</div>
        </div>

        <div className="bg-white p-4 border-b">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <span className="text-xs mt-1 font-medium">날짜 선택</span>
              </div>
              <div className="flex-1 h-1 bg-primary mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <span className="text-xs mt-1 font-medium">숙소 선택</span>
              </div>
              <div className="flex-1 h-1 bg-primary mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <span className="text-xs mt-1 font-medium">관광지/맛집</span>
              </div>
              <div className="flex-1 h-1 bg-primary mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <span className="text-xs mt-1 font-medium">일정 확정</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-b">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="text-primary mr-2" size={20} />
              <span className="font-medium">
                {formatDate(currentTripPlan.startDate)} - {formatDate(currentTripPlan.endDate)} ({totalDays}일)
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                editMode
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Edit size={16} className="mr-1" />
              {editMode ? "편집 완료" : "일정 편집"}
            </button>
          </div>
        </div>

        <div className="flex border-b overflow-x-auto">
          {tripDays.map((tripDay, index) => {
            const dayNumber = index + 1
            const placesCount = tripDay.destinations.length

            return (
              <button
                key={`day-tab-${tripDay.tripDayId}`}
                className={`px-6 py-3 whitespace-nowrap transition-colors ${
                  activeDay === dayNumber
                    ? "border-b-2 border-primary font-medium text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveDay(dayNumber)}
              >
                {dayNumber}일차 ({formatDate(tripDay.date)}, {getDayOfWeek(tripDay.date)}) - {placesCount}개
              </button>
            )
          })}
        </div>

        <div className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 300px)" }}>
          {tripDays[activeDay - 1] && (
            <>
              <h2 className="text-xl font-bold mb-4">
                {activeDay}일차 일정 ({formatDate(tripDays[activeDay - 1].date)},{" "}
                {getDayOfWeek(tripDays[activeDay - 1].date)})
              </h2>

              <div className="space-y-6">
                {tripDays[activeDay - 1].destinations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">선택된 장소가 없습니다</div>
                    <div className="text-gray-500 text-sm">이전 단계에서 관광지나 숙소를 선택해주세요</div>
                  </div>
                ) : (
                  tripDays[activeDay - 1].destinations
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((destination, index, array) => (
                      <div
                        key={`destination-${destination.id}`}
                        className={`rounded-lg p-4 transition-all duration-200 bg-white border border-gray-200 shadow-sm ${
                          dragOverItem === index ? "border-primary bg-primary/5" : ""
                        } ${draggedItem === index ? "opacity-50" : ""}`}
                        draggable={editMode}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: editMode ? "move" : "default" }}
                      >
                        <div className="flex items-start">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 ${
                              destination.type === "accommodation" ? "bg-primary" : "bg-primary font-bold"
                            }`}
                          >
                            {destination.type === "accommodation" ? <Hotel size={20} /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg mb-2 text-gray-900">
                                  {placeDetails[destination.placeId]?.name || `장소 ID: ${destination.placeId}`}
                                </h4>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <ClockIcon size={14} className="mr-1" />
                                  <span>
                                    {destination.type === "accommodation"
                                      ? "숙박"
                                      : "관광지"}
                                  </span>
                                </div>
                                {editMode && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="text-xs text-gray-500">순서:</div>
                                    <select
                                      value={destination.sequence}
                                      onChange={(e) => handleSequenceChange(destination.id, Number(e.target.value))}
                                      className="text-xs border rounded px-2 py-1 bg-white"
                                    >
                                      {Array.from({ length: tripDays[activeDay - 1].destinations.length }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                          {i + 1}번째
                                        </option>
                                      ))}
                                    </select>
                                    <div className="text-xs text-gray-500">또는 드래그하여 순서 변경</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center ml-4">
                                <div className="w-20 h-20 relative rounded-lg overflow-hidden mr-3">
                                  <Image
                                    src={
                                      placeDetails[destination.placeId]?.imageUrl ||
                                      `/placeholder.svg?height=80&width=80&text=${
                                        destination.type === "accommodation" ? "숙소" : "관광지"
                                      }`
                                    }
                                    alt={placeDetails[destination.placeId]?.name || destination.placeId}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = `/placeholder.svg?height=80&width=80&text=${
                                        destination.type === "accommodation" ? "숙소" : "관광지"
                                      }`
                                    }}
                                  />
                                </div>
                                {editMode && (
                                  <button
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    onClick={() => removeDestination(tripDays[activeDay - 1].tripDayId, destination.id)}
                                  >
                                    <Trash size={18} />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {editMode && (
                <div className="mt-6 flex justify-center gap-4">
                  <Link
                    href={`/planning/flow/accommodation-selection?tripPlanId=${currentTripPlan.id}`}
                    className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Hotel size={18} className="mr-2" />
                    숙소 추가하기
                  </Link>
                  <Link
                    href={`/planning/flow/attraction-selection?tripPlanId=${currentTripPlan.id}`}
                    className="flex items-center px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    관광지 추가하기
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-between">
          <Link
            href={`/planning/flow/attraction-selection?tripPlanId=${currentTripPlan.id}`}
            className="px-6 py-2 border rounded-md flex items-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            이전
          </Link>
          <button
            onClick={handleSaveItinerary}
            className="px-8 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            일정 완료하기
          </button>
        </div>
      </div>

      <div className="w-1/3">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">여행 경로</h2>
            <div className="flex gap-2">
              <button className="p-2 border rounded-md hover:bg-primary/50 transition-colors">
                <Save size={18} className="text-primary" />
              </button>
              <button className="p-2 border rounded-md hover:bg-primary/50 transition-colors">
                <Share2 size={18} className="text-primary" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <KakaoMap
              key={`map-${activeDay}`} // activeDay가 변경될 때마다 컴포넌트 재렌더링 강제
              places={
                tripDays[activeDay - 1]?.destinations.map((dest) => {
                  // 실제 장소 데이터에서 좌표 가져오기
                  let latitude = placeDetails[dest.placeId]?.latitude || dest.latitude
                  let longitude = placeDetails[dest.placeId]?.longitude || dest.longitude

                  // 여전히 좌표가 없으면 기본값 사용 (하드코딩)
                  if (!latitude || !longitude) {
                    if (dest.type === "accommodation") {
                      latitude = 33.4996
                      longitude = 126.5312
                    } else if (dest.type === "attraction") {
                      latitude = 33.2541
                      longitude = 126.5601
                    } else {
                      latitude = 33.4996
                      longitude = 126.5312
                    }
                  }

                  return {
                    id: dest.id,
                    placeId: dest.placeId,
                    type: dest.type,
                    placeName: placeDetails[dest.placeId]?.name || dest.placeId,
                    latitude: latitude,
                    longitude: longitude,
                    sequence: dest.sequence,
                  }
                }) || []
              }
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, ChevronLeft, Heart, X } from "lucide-react"
import { attractionService } from "@/lib/attraction-service"
import { tripService } from "@/lib/trip-service"
import { authService } from "@/lib/auth-service"
import type { TripPlanDto, AttractionDto } from "@/types/api-types"
import KakaoMap from "@/components/kakao-map"
import type { MarkerData } from "@/lib/kakao-map"

interface SelectedAttraction {
  attraction: AttractionDto
  dayIndex: number
  sequence: number
}

export default function AttractionSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [attractions, setAttractions] = useState<AttractionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [attractionsLoading, setAttractionsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("전체")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([])
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
  const [hoveredAttraction, setHoveredAttraction] = useState<AttractionDto | null>(null)

  // 서버에서 로드한 여행 계획 정보
  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlanDto | null>(null)
  const [tripPlanId, setTripPlanId] = useState<number | null>(null)
  const [tripDays, setTripDays] = useState<any[]>([])

  // 중복 호출 방지
  const loadingRef = useRef(false)

  useEffect(() => {
    // URL 파라미터에서 tripPlanId 가져오기
    const planIdParam = searchParams.get("tripPlanId")

    if (!planIdParam) {
      alert("여행 계획 정보가 없습니다. 처음부터 다시 시작해주세요.")
      router.push("/planning/flow/date-selection")
      return
    }

    // 인증 확인
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    const planId = Number(planIdParam)
    setTripPlanId(planId)

    // 즉시 관광지 로딩 시작 (기본 카테고리로)
    loadInitialAttractions()

    // 여행 계획 정보 로드 (중복 방지, 병렬 진행)
    if (!loadingRef.current) {
      loadTripPlan(planId)
    }
  }, [searchParams, router])

  const loadInitialAttractions = async () => {
    setAttractionsLoading(true)

    try {
      // 기본 카테고리("전체")로 관광지 로드
      const attractionData = await attractionService.getAllAttractions()
      setAttractions(attractionData)
    } catch (error) {
      setAttractions([])
    } finally {
      setAttractionsLoading(false)
    }
  }

  const loadTripPlan = async (planId: number) => {
    if (loadingRef.current) {
      return
    }

    try {
      loadingRef.current = true
      setLoading(true)

      // 여행 계획 기본 정보 조회
      const planResponse = await tripService.getTripPlan(planId)

      let tripPlanData
      if (planResponse.data) {
        tripPlanData = planResponse.data
      } else if (planResponse.tripPlanId || planResponse.id) {
        tripPlanData = planResponse
      } else {
        throw new Error("여행 계획 데이터를 찾을 수 없습니다.")
      }

      setCurrentTripPlan(tripPlanData)

      // 여행 일정 조회
      // 목적지 정보까지 포함해서 로드 (sequence 계산을 위해)
      const daysResponse = await tripService.getTripDaysWithDestinations(planId)
      let daysData
      if (daysResponse.data) {
        daysData = daysResponse.data
      } else if (Array.isArray(daysResponse)) {
        daysData = daysResponse
      } else {
        throw new Error("여행 일정을 찾을 수 없습니다.")
      }

      setTripDays(daysData)

      // 관광지 데이터 로드 (한 번만)
      await loadAttractions()
    } catch (error) {
      alert("여행 계획을 불러오는데 실패했습니다.")
      router.push("/planning/flow/date-selection")
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  const loadAttractions = async () => {
    try {
      setAttractionsLoading(true)

      let attractionData = []
      if (activeCategory === "전체") {
        attractionData = await attractionService.getAllAttractions()
      } else {
        attractionData = await attractionService.searchAttractionsByCategory(activeCategory)
      }

      setAttractions(attractionData)

      // 관광지 데이터만 설정하고, 마커는 별도로 관리
    } catch (error) {
      // 기존 데이터 유지
    } finally {
      setAttractionsLoading(false)
    }
  }

  // 카테고리 변경 시 관광지 업데이트 (초기 로딩 완료 후)
  useEffect(() => {
    if (attractions.length > 0) {
      loadAttractions()
    }
  }, [activeCategory])

  // 선택된 관광지와 호버된 관광지만 지도에 표시
  useEffect(() => {
    const selectedMarkers: MarkerData[] = selectedAttractions
      .map((sa) => sa.attraction)
      .filter((attraction) => attraction.latitude && attraction.longitude)
      .map((attraction) => ({
        id: attraction.contentsId || attraction.id,
        position: {
          lat: attraction.latitude,
          lng: attraction.longitude,
        },
        title: attraction.name,
        content: `<strong>${attraction.name}</strong><br/>선택된 관광지<br/>${attraction.address || ""}`,
      }))

    // 호버된 관광지가 있고 위치 정보가 있으면 지도에 추가
    const hoveredMarker: MarkerData[] = hoveredAttraction && hoveredAttraction.latitude && hoveredAttraction.longitude
      ? [{
          id: `hovered-${hoveredAttraction.contentsId || hoveredAttraction.id}`,
          position: {
            lat: hoveredAttraction.latitude,
            lng: hoveredAttraction.longitude,
          },
          title: hoveredAttraction.name,
          content: `<strong>${hoveredAttraction.name}</strong><br/>호버된 관광지<br/>${hoveredAttraction.address || ""}`,
        }]
      : []

    const allMarkers = [...selectedMarkers, ...hoveredMarker]
    setMapMarkers(allMarkers)
  }, [selectedAttractions, hoveredAttraction])

  const handleAttractionSelect = async (attraction: AttractionDto, dayIndex: number) => {
    if (!tripPlanId || !tripDays[dayIndex]) {
      alert("여행 일정 정보가 없습니다.")
      return
    }

    try {
        attraction: attraction.name,
        day: dayIndex + 1,
      })

      const tripDay = tripDays[dayIndex]
      const dayId = tripDay.id || tripDay.tripDayId

      // 현재 서버의 목적지 개수 기준으로 sequence 계산 (더 안전함)
      const currentDestinationsCount = tripDay.destinations?.length || 0
      const nextSequence = currentDestinationsCount + 1


      // 서버에 관광지 목적지 추가
      await tripService.addDestination(
        dayId,
        attraction.contentsId || attraction.id,
        "attraction",
        nextSequence,
        120, // 2시간
        null,
        0,
      )

      // 로컬 상태 업데이트
      const newSelection: SelectedAttraction = {
        attraction,
        dayIndex,
        sequence: selectedAttractions.filter((sa) => sa.dayIndex === dayIndex).length + 1,
      }
      setSelectedAttractions([...selectedAttractions, newSelection])

    } catch (error) {
      alert(`관광지 추가에 실패했습니다: ${error.message}`)
    }
  }

  const handleAttractionRemove = async (index: number) => {
    const selection = selectedAttractions[index]
    if (!selection || !tripPlanId) return

    try {

      // 로컬 상태 업데이트
      const updatedSelections = [...selectedAttractions]
      updatedSelections.splice(index, 1)
      setSelectedAttractions(updatedSelections)

      // 서버에서 목적지 삭제 API 호출
    } catch (error) {
    }
  }

  const handleContinue = () => {
    if (!tripPlanId) {
      alert("여행 계획 정보가 없습니다.")
      return
    }

    // 다음 단계로 이동 (tripPlanId 전달)
    router.push(`/planning/flow/itinerary-confirmation?tripPlanId=${tripPlanId}`)
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleAttractionHover = (attraction: AttractionDto) => {
    setHoveredAttraction(attraction)
  }

  const handleAttractionLeave = () => {
    setHoveredAttraction(null)
  }

  const categories = ["전체", "자연", "문화", "체험", "음식"]

  const filteredAttractions = attractions.filter((attraction) => {
    if (searchQuery) {
      const searchText = `${attraction.name} ${attraction.address || ""}`.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    }
    return true
  })

  // 로딩 중이거나 여행 계획이 없는 경우
  if (loading && !currentTripPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-gray-600">여행 계획을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (!currentTripPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">여행 계획을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-8">처음부터 다시 시작해주세요.</p>
          <Link
            href="/planning/flow/date-selection"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            새 여행 계획하기
          </Link>
        </div>
      </div>
    )
  }

  const calculateNights = () => {
    if (!currentTripPlan.startDate || !currentTripPlan.endDate) return 0
    const start = new Date(currentTripPlan.startDate)
    const end = new Date(currentTripPlan.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <div className="max-w-full mx-auto bg-white min-h-screen flex">
      {/* 왼쪽 패널 - 관광지 선택 */}
      <div className="w-1/2 border-r">
        {/* 헤더 */}
        <div className="p-4 border-b flex items-center">
          <Link href="/" className="mr-4">
            <div className="text-xl font-bold text-orange-600">재곰제곰</div>
          </Link>
          <div className="text-lg font-medium ml-4">여행 계획 세우기</div>
          <div className="ml-auto relative">
            <input
              type="text"
              placeholder="관광지 검색..."
              className="pl-9 pr-4 py-2 border rounded-full text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div className="bg-gray-50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="text-xs mt-1 font-medium">날짜 선택</span>
              </div>
              <div className="flex-1 h-1 bg-orange-600 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="text-xs mt-1 font-medium">숙소 선택</span>
              </div>
              <div className="flex-1 h-1 bg-orange-600 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-xs mt-1">관광지/맛집</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold">
                  4
                </div>
                <span className="text-xs mt-1">일정 확정</span>
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 날짜 표시 */}
        <div className="bg-white p-4 border-b">
          <div className="max-w-3xl mx-auto flex items-center">
            <Calendar className="text-orange-600 mr-2" size={20} />
            <span className="font-medium">
              {formatDate(currentTripPlan.startDate)} - {formatDate(currentTripPlan.endDate)} ({calculateNights()}박{" "}
              {calculateNights() + 1}일)
            </span>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">카테고리</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  activeCategory === category
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 관광지 목록 */}
        <div className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 400px)" }}>
          {attractionsLoading && attractions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <div className="text-gray-500">관광지를 검색하고 있습니다...</div>
              </div>
            </div>
          ) : filteredAttractions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 mb-2">검색된 관광지가 없습니다.</div>
                <div className="text-xs text-gray-400">
                  전체 데이터: {attractions.length}개 | 필터 결과: {filteredAttractions.length}개
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {attractionsLoading && attractions.length > 0 && (
                <div className="absolute top-0 right-0 z-10 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                  업데이트 중...
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {filteredAttractions.map((attraction) => (
                <div
                  key={attraction.contentsId || attraction.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  onMouseEnter={() => handleAttractionHover(attraction)}
                  onMouseLeave={handleAttractionLeave}
                >
                  <div className="relative h-48">
                    <Image
                      src={attraction.imageUrl || "/placeholder.svg?height=192&width=384&text=관광지이미지"}
                      alt={attraction.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=192&width=384&text=이미지없음"
                      }}
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
                      onClick={(e) => toggleFavorite(attraction.contentsId || attraction.id, e)}
                    >
                      <Heart
                        size={18}
                        className={
                          favorites.includes(attraction.contentsId || attraction.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }
                      />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="text-white">
                        <h3 className="font-bold text-sm">{attraction.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin size={12} className="mr-1" />
                      <span className="truncate">{attraction.address || "주소 정보 없음"}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <select
                        className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 border-orange-600"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAttractionSelect(attraction, Number.parseInt(e.target.value))
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          일차 추가
                        </option>
                        {tripDays.map((day, dayIndex) => (
                          <option key={dayIndex} value={dayIndex}>
                            {dayIndex + 1}일차 추가
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t flex justify-between">
          <Link
            href={`/planning/flow/accommodation-selection?tripPlanId=${tripPlanId}`}
            className="px-6 py-2 border rounded-md flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" />
            이전
          </Link>
          <button
            onClick={handleContinue}
            className="px-8 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
          >
            다음 단계로
          </button>
        </div>
      </div>

      {/* 중앙 패널 - 선택된 관광지 목록 */}
      <div className="w-1/4 border-r">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-medium">선택된 관광지</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedAttractions.length === 0 ? (
              <div className="text-sm text-gray-500">아직 선택된 관광지가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {tripDays.map((day, dayIndex) => {
                  const dayAttractions = selectedAttractions.filter((sa) => sa.dayIndex === dayIndex)
                  return (
                    <div key={dayIndex} className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">{dayIndex + 1}일차</h4>
                      {dayAttractions.length === 0 ? (
                        <div className="text-xs text-gray-500">선택된 관광지가 없습니다.</div>
                      ) : (
                        <div className="space-y-2">
                          {dayAttractions.map((selection, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{selection.attraction.name}</div>
                                <div className="text-xs text-gray-500 truncate">{selection.attraction.address}</div>
                              </div>
                              <button
                                onClick={() => handleAttractionRemove(selectedAttractions.indexOf(selection))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽 패널 - 지도 */}
      <div className="w-1/4">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-sm font-medium">관광지 위치</h2>
            <div className="text-xs text-gray-500 mt-1">
              {mapMarkers.length > 0 ? `${mapMarkers.length}개 관광지 표시` : "위치 정보 없음"}
            </div>
          </div>
          <div className="flex-1">
            <KakaoMap
              height="100%"
              center={{ lat: 33.3617, lng: 126.5292 }}
              level={8}
              markers={mapMarkers}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

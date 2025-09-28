"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, ChevronLeft, Heart, X } from "lucide-react"
import { accommodationService } from "@/lib/accommodation-service"
import { tripService } from "@/lib/trip-service"
import { authService } from "@/lib/auth-service"
import type { PlaceDto, RoomDto, TripPlanDto } from "@/types/api-types"
import KakaoMap from "@/components/kakao-map"
import type { MarkerData } from "@/lib/kakao-map"

interface SelectedAccommodation {
  place: PlaceDto
  room: RoomDto
  checkInDate: string
  checkOutDate: string
}


export default function AccommodationSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [accommodations, setAccommodations] = useState<PlaceDto[]>([])
  const [loading, setLoading] = useState(false)
  const [accommodationsLoading, setAccommodationsLoading] = useState(false)
  const [activeRegion, setActiveRegion] = useState("제주시")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceDto | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [availableRooms, setAvailableRooms] = useState<RoomDto[]>([])
  const [selectedAccommodations, setSelectedAccommodations] = useState<SelectedAccommodation[]>([])
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
  const [tripDays, setTripDays] = useState<any[]>([])

  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlanDto | null>(null)
  const [tripPlanId, setTripPlanId] = useState<number | null>(null)
  const [hoveredAccommodation, setHoveredAccommodation] = useState<PlaceDto | null>(null)

  useEffect(() => {
    const planIdParam = searchParams.get("tripPlanId")

    if (!planIdParam) {
      alert("여행 계획 정보가 없습니다. 처음부터 다시 시작해주세요.")
      router.push("/planning/flow/date-selection")
      return
    }

    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    const planId = Number(planIdParam)
    setTripPlanId(planId)

    // 기본 숙소 로딩을 즉시 시작 (기본 날짜로)
    loadInitialAccommodations()
    
    // 여행 계획 로딩은 병렬로 진행
    loadTripPlan(planId)
  }, [searchParams, router])

  const loadInitialAccommodations = async () => {
    setAccommodationsLoading(true)

    try {
      // 기본 날짜로 숙소 검색 (오늘부터 내일까지)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const startDate = today.toISOString().split('T')[0]
      const endDate = tomorrow.toISOString().split('T')[0]

      const places = await accommodationService.searchPlaces(activeRegion, startDate, endDate, 2)
      setAccommodations(places)
    } catch (error) {
      setAccommodations([])
    } finally {
      setAccommodationsLoading(false)
    }
  }

  const loadTripPlan = async (planId: number) => {
    try {
      setLoading(true)

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

      // 실제 여행 날짜로 숙소 다시 검색 (기존 데이터와 교체)
      if (tripPlanData.startDate && tripPlanData.endDate) {
        searchAccommodationsWithDates(tripPlanData.startDate, tripPlanData.endDate)
      }

      // 목적지 정보까지 포함해서 로드 (sequence 계산을 위해)
      const daysResponse = await tripService.getTripDaysWithDestinations(planId)
      let tripDaysData
      if (daysResponse.data) {
        tripDaysData = daysResponse.data
      } else if (Array.isArray(daysResponse)) {
        tripDaysData = daysResponse
      } else {
        throw new Error("여행 일정을 찾을 수 없습니다.")
      }

      setTripDays(tripDaysData)
    } catch (error) {
      alert("여행 계획을 불러오는데 실패했습니다.")
      router.push("/planning/flow/date-selection")
    } finally {
      setLoading(false)
    }
  }

  const searchAccommodationsWithDates = async (startDate: string, endDate: string) => {
    setAccommodationsLoading(true)

    try {
      const places = await accommodationService.searchPlaces(activeRegion, startDate, endDate, 2)


      setAccommodations(places)
    } catch (error) {
      // 기존 데이터 유지
    } finally {
      setAccommodationsLoading(false)
    }
  }

  const searchAccommodations = async (startDate: string, endDate: string) => {
    setAccommodationsLoading(true)

    try {
      const places = await accommodationService.searchPlaces(activeRegion, startDate, endDate, 2)


      setAccommodations(places)

      const selectedMarkers: MarkerData[] = selectedAccommodations
        .filter((acc) => acc.place.latitude && acc.place.longitude)
        .map((acc) => ({
          id: acc.place.id,
          position: {
            lat: acc.place.latitude,
            lng: acc.place.longitude,
          },
          title: acc.place.name,
          content: `<strong>${acc.place.name}</strong><br/>선택된 숙소`,
        }))

      setMapMarkers(selectedMarkers)
    } catch (error) {
      setAccommodations([])
      setMapMarkers([])
    } finally {
      setAccommodationsLoading(false)
    }
  }

  useEffect(() => {
    if (currentTripPlan && currentTripPlan.startDate && currentTripPlan.endDate) {
      searchAccommodationsWithDates(currentTripPlan.startDate, currentTripPlan.endDate)
    }
  }, [activeRegion, currentTripPlan])

  useEffect(() => {
    const selectedMarkers: MarkerData[] = selectedAccommodations
      .filter((acc) => acc.place.latitude && acc.place.longitude)
      .map((acc) => ({
        id: acc.place.id,
        position: {
          lat: acc.place.latitude,
          lng: acc.place.longitude,
        },
        title: acc.place.name,
        content: `<strong>${acc.place.name}</strong><br/>선택된 숙소`,
      }))

    // 호버된 숙소가 있고 위치 정보가 있으면 지도에 추가
    const hoveredMarker: MarkerData[] = hoveredAccommodation && hoveredAccommodation.latitude && hoveredAccommodation.longitude
      ? [{
          id: `hovered-${hoveredAccommodation.id}`,
          position: {
            lat: hoveredAccommodation.latitude,
            lng: hoveredAccommodation.longitude,
          },
          title: hoveredAccommodation.name,
          content: `<strong>${hoveredAccommodation.name}</strong><br/>호버된 숙소`,
        }]
      : []

    const allMarkers = [...selectedMarkers, ...hoveredMarker]
    setMapMarkers(allMarkers)
  }, [selectedAccommodations, hoveredAccommodation])

  const handleAccommodationClick = async (place: PlaceDto) => {
    return
  }

  const handleDaySelection = async (place: PlaceDto, dayIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!place) {
      return
    }

    setSelectedPlace(place)
    setSelectedDayIndex(dayIndex)
    setLoading(true)

    try {
      if (!currentTripPlan) {
        throw new Error("여행 계획 정보가 없습니다.")
      }

      const rooms = await accommodationService.searchRooms(
        place.id,
        currentTripPlan.startDate,
        currentTripPlan.endDate,
        2,
      )
      setAvailableRooms(rooms)
      setShowDetailModal(true)
    } catch (error) {
      setAvailableRooms([])
      setShowDetailModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccommodation = async (room: RoomDto, dayIndex: number) => {
    if (!selectedPlace || !currentTripPlan || !tripPlanId) {
      alert("여행 계획 정보가 없습니다.")
      return
    }

    const actualDayIndex = selectedDayIndex !== null ? selectedDayIndex : dayIndex

    try {
        place: selectedPlace.name,
        room: room.roomName,
        dayIndex: actualDayIndex + 1,
      })

      const day = tripDays[actualDayIndex]
      if (!day) {
          dayIndex: actualDayIndex,
          availableDays: tripDays.map((d: any) => d.date),
        })
        throw new Error("체크인 날짜에 해당하는 여행 일정을 찾을 수 없습니다.")
      }


      // 현재 날짜의 목적지 개수 확인하여 다음 sequence 계산
      const currentDestinationsCount = day.destinations?.length || 0
      const nextSequence = currentDestinationsCount + 1


      await tripService.addDestination(
        day.id || day.tripDayId,
        selectedPlace.id,
        "accommodation",
        nextSequence,
        1440,
        null,
        room.price || 0,
      )


      const newAccommodation: SelectedAccommodation = {
        place: selectedPlace,
        room,
        checkInDate: day.date,
        checkOutDate: day.date,
      }
      setSelectedAccommodations([...selectedAccommodations, newAccommodation])
      setShowDetailModal(false)
      setSelectedDayIndex(null)

      alert("숙소가 선택되었습니다!")
    } catch (error) {
      alert(`숙소 추가에 실패했습니다: ${error.message}`)
    }
  }

  const removeAccommodation = async (index: number) => {
    const accommodation = selectedAccommodations[index]
    if (!accommodation || !tripPlanId) return

    try {

      const updatedAccommodations = [...selectedAccommodations]
      updatedAccommodations.splice(index, 1)
      setSelectedAccommodations(updatedAccommodations)
    } catch (error) {
    }
  }

  const handleContinue = () => {
    if (!tripPlanId) {
      alert("여행 계획 정보가 없습니다.")
      return
    }

    router.push(`/planning/flow/attraction-selection?tripPlanId=${tripPlanId}`)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
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

  const handleAccommodationHover = (place: PlaceDto) => {
    setHoveredAccommodation(place)
  }

  const handleAccommodationLeave = () => {
    setHoveredAccommodation(null)
  }



  const regions = ["제주시", "서귀포시", "애월", "한림", "성산", "표선", "중문"]

  const filteredAccommodations = accommodations.filter((place) => {
    if (searchQuery) {
      return place.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

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

  return (
    <div className="max-w-full mx-auto bg-white min-h-screen flex">
      <div className="w-1/2 border-r">
        <div className="p-4 border-b flex items-center">
          <Link href="/" className="mr-4">
            <div className="text-xl font-bold text-orange-600">재곰제곰</div>
          </Link>
          <div className="text-lg font-medium ml-4">여행 계획 세우기</div>
          <div className="ml-auto relative">
            <input
              type="text"
              placeholder="숙소 검색..."
              className="pl-9 pr-4 py-2 border rounded-full text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

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
                  2
                </div>
                <span className="text-xs mt-1 font-medium">숙소 선택</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold">
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

        <div className="bg-white p-4 border-b">
          <div className="max-w-3xl mx-auto flex items-center">
            <Calendar className="text-orange-600 mr-2" size={20} />
            <span className="font-medium">
              {formatDate(currentTripPlan.startDate)} - {formatDate(currentTripPlan.endDate)} ({calculateNights()}박{" "}
              {calculateNights() + 1}일)
            </span>
            <Link href="/planning/flow/date-selection" className="ml-2 text-sm text-gray-600 hover:underline">
              변경
            </Link>
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">지역</h3>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <button
                key={region}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  activeRegion === region ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 400px)" }}>
          {accommodationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <div className="text-gray-500">숙소를 검색하고 있습니다...</div>
                {accommodations.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">기존 데이터 업데이트 중...</div>
                )}
              </div>
            </div>
          ) : filteredAccommodations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 mb-2">검색된 숙소가 없습니다.</div>
                <div className="text-xs text-gray-400">
                  전체 데이터: {accommodations.length}개 | 필터 결과: {filteredAccommodations.length}개
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {accommodationsLoading && accommodations.length > 0 && (
                <div className="absolute top-0 right-0 z-10 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                  업데이트 중...
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {filteredAccommodations.map((place) => (
                <div 
                  key={place.id} 
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  onMouseEnter={() => handleAccommodationHover(place)}
                  onMouseLeave={handleAccommodationLeave}
                >
                  <div className="relative h-48">
                    <Image
                      src={place.imageUrl || "/placeholder.svg?height=192&width=384&text=숙소이미지"}
                      alt={place.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=192&width=384&text=이미지없음"
                      }}
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
                      onClick={(e) => toggleFavorite(place.id, e)}
                    >
                      <Heart
                        size={18}
                        className={favorites.includes(place.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="text-white">
                        <h3 className="font-bold text-sm">{place.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="mt-2 flex justify-end">
                      <select
                        className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 border-orange-600"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDaySelection(place, Number.parseInt(e.target.value))
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


        <div className="p-4 border-t flex justify-between">
          <Link href="/planning/flow/date-selection" className="px-6 py-2 border rounded-md flex items-center">
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

      <div className="w-1/4 border-r">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-medium">선택된 숙소</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedAccommodations.length === 0 ? (
              <div className="text-sm text-gray-500">아직 선택된 숙소가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {selectedAccommodations.map((accommodation, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{accommodation.place.name}</h4>
                      <button onClick={() => removeAccommodation(index)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{accommodation.room.roomName}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(accommodation.checkInDate)} - {formatDate(accommodation.checkOutDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/4">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-sm font-medium">숙소 위치</h2>
            <div className="text-xs text-gray-500 mt-1">
              {mapMarkers.length > 0 ? `${mapMarkers.length}개 숙소 표시` : "위치 정보 없음"}
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

      {showDetailModal && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedPlace.name}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedDayIndex(null)
                }}
                className="text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="relative h-64 mb-4">
                  <Image
                    src={selectedPlace.imageUrl || "/placeholder.svg?height=256&width=600&text=숙소이미지"}
                    alt={selectedPlace.name}
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=256&width=600&text=이미지없음"
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">이용 가능한 객실</h3>
                {selectedDayIndex !== null && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-700">
                      <strong>{selectedDayIndex + 1}일차</strong>에 추가할 객실을 선택해주세요.
                    </div>
                  </div>
                )}
                {loading ? (
                  <div className="text-center py-8">객실 정보를 불러오는 중...</div>
                ) : availableRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">이용 가능한 객실이 없습니다.</div>
                ) : (
                  <div className="space-y-4">
                    {availableRooms.map((room) => (
                      <div key={room.roomId} className="border rounded-lg p-4">
                        <div className="flex">
                          <div className="w-1/3 mr-4">
                            {room.images && room.images.length > 0 ? (
                              <div className="relative h-32 rounded overflow-hidden">
                                <Image
                                  src={room.images[0] || "/placeholder.svg?height=128&width=200&text=객실이미지"}
                                  alt={room.roomName}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=128&width=200&text=이미지없음"
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500 text-sm">이미지 없음</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg">{room.roomName}</h4>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => handleAddAccommodation(room, selectedDayIndex || 0)}
                                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                              >
                                이 객실 선택
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

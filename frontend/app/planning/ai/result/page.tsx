"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Calendar, Users, RefreshCw, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recommendationService } from "@/lib/recommendation-service"
import type { KeywordRecommendationRequest } from "@/types/api-types"
import ItineraryMap from "@/components/ItineraryMap"

// 프로덕션 환경에서 콘솔 로그 비활성화
const isDev = process.env.NODE_ENV === 'development'
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

const generateMockItineraries = (tripData: any) => {
  const { startDate, endDate, travelers, keywords } = tripData
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const randomSeed = Math.random()

  const itinerary1 = {
    id: 1,
    title: randomSeed > 0.5 ? "자연과 힐링 중심 코스" : "바다와 산 체험 코스",
    description:
      randomSeed > 0.5
        ? "제주의 아름다운 자연을 만끽하며 여유로운 시간을 보내는 일정"
        : "제주의 바다와 산을 모두 체험할 수 있는 활동적인 일정",
    days: Array.from({ length: days }, (_, dayIndex) => ({
      day: dayIndex + 1,
      date: new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      places: [
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "성산일출봉"
                : dayIndex === 1
                  ? "한라산 국립공원"
                  : "우도"
              : dayIndex === 0
                ? "협재해수욕장"
                : dayIndex === 1
                  ? "천지연폭포"
                  : "섭지코지",
          address:
            dayIndex === 0
              ? "제주특별자치도 서귀포시 성산읍"
              : dayIndex === 1
                ? "제주특별자치도 제주시 해안동"
                : "제주특별자치도 제주시 우도면",
          time: "09:00 - 12:00",
          type: "관광지",
        },
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "제주 힐링 스테이"
                : dayIndex === 1
                  ? "한라산 리조트"
                  : "우도 펜션"
              : dayIndex === 0
                ? "해변 리조트"
                : dayIndex === 1
                  ? "산방산 펜션"
                  : "성산 호텔",
          address: "제주특별자치도 제주시",
          time: "체크인",
          type: "숙소",
        },
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "흑돼지 맛집"
                : dayIndex === 1
                  ? "한라봉 카페"
                  : "해산물 전문점"
              : dayIndex === 0
                ? "갈치조림 맛집"
                : dayIndex === 1
                  ? "옥돔구이 전문점"
                  : "전복죽 맛집",
          address: "제주특별자치도 제주시",
          time: "18:00 - 20:00",
          type: "맛집",
        },
      ],
    })),
  }

  const itinerary2 = {
    id: 2,
    title: randomSeed > 0.5 ? "문화와 체험 중심 코스" : "역사와 전통 탐방 코스",
    description:
      randomSeed > 0.5
        ? "제주의 독특한 문화를 체험하고 다양한 활동을 즐기는 일정"
        : "제주의 역사와 전통을 깊이 있게 탐방하는 일정",
    days: Array.from({ length: days }, (_, dayIndex) => ({
      day: dayIndex + 1,
      date: new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      places: [
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "제주민속촌"
                : dayIndex === 1
                  ? "테디베어 뮤지엄"
                  : "만장굴"
              : dayIndex === 0
                ? "돌하르방공원"
                : dayIndex === 1
                  ? "제주목관아"
                  : "삼성혈",
          address:
            dayIndex === 0
              ? "제주특별자치도 서귀포시 표선면"
              : dayIndex === 1
                ? "제주특별자치도 서귀포시 중문동"
                : "제주특별자치도 제주시 구좌읍",
          time: "10:00 - 13:00",
          type: "관광지",
        },
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "제주 문화 호텔"
                : dayIndex === 1
                  ? "중문 리조트"
                  : "동부 펜션"
              : dayIndex === 0
                ? "전통 한옥 스테이"
                : dayIndex === 1
                  ? "제주시 호텔"
                  : "서부 펜션",
          address: "제주특별자치도 서귀포시",
          time: "체크인",
          type: "숙소",
        },
        {
          name:
            randomSeed > 0.5
              ? dayIndex === 0
                ? "갈치조림 맛집"
                : dayIndex === 1
                  ? "옥돔구이 전문점"
                  : "전복죽 맛집"
              : dayIndex === 0
                ? "고기국수 맛집"
                : dayIndex === 1
                  ? "빙떡 전문점"
                  : "몸국 맛집",
          address: "제주특별자치도 서귀포시",
          time: "19:00 - 21:00",
          type: "맛집",
        },
      ],
    })),
  }

  return [itinerary1, itinerary2]
}

export default function AIResultPage() {
  const router = useRouter()
  const [tripData, setTripData] = useState<any>(null)
  const [itineraries, setItineraries] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null)
  const [activeDayA, setActiveDayA] = useState<number | null>(1)
  const [activeDayB, setActiveDayB] = useState<number | null>(1)

  useEffect(() => {
    const savedTripData = localStorage.getItem("aiTripData")
    if (!savedTripData) {
      router.push("/planning/ai")
      return
    }

    const data = JSON.parse(savedTripData)
    setTripData(data)

    // 즉시 더미 데이터를 생성하여 빠른 표시
    const mockItineraries = generateMockItineraries(data)
    setItineraries(mockItineraries)
    
    // 첫 번째 일정을 즉시 선택
    if (mockItineraries.length > 0) {
      setSelectedItinerary(mockItineraries[0])
    }

    // API에서 받은 추천 데이터가 있으면 나중에 업데이트
    if (data.recommendations && data.recommendations.options) {
      setTimeout(() => {
        setItineraries(data.recommendations.options)
        if (data.recommendations.options.length > 0) {
          setSelectedItinerary(data.recommendations.options[0])
        }
      }, 100) // 100ms 후에 API 데이터로 업데이트
    }
  }, [router])

  // selectedItinerary가 변경될 때 activeDay 초기화
  useEffect(() => {
    if (selectedItinerary) {
      // 첫 번째 일정인 경우 activeDayA를 1로 설정
      if (selectedItinerary === itineraries[0]) {
        setActiveDayA(1)
      } else if (selectedItinerary === itineraries[1]) {
        // 두 번째 일정인 경우 activeDayB를 1로 설정
        setActiveDayB(1)
      }
    }
  }, [selectedItinerary, itineraries])

  // 페이지 로딩 시 첫 번째 일정이 선택되면 activeDayA를 1로 강제 설정
  useEffect(() => {
    if (selectedItinerary && selectedItinerary === itineraries[0]) {
      setActiveDayA(1)
    }
  }, [selectedItinerary, itineraries])

  // 페이지 최초 로딩 시 activeDay 강제 설정 (더 강력한 초기화)
  useEffect(() => {
    if (itineraries.length > 0 && selectedItinerary && !activeDayA && !activeDayB) {
      setActiveDayA(1)
      setActiveDayB(1)
    }
  }, [itineraries.length, selectedItinerary, activeDayA, activeDayB])

  const handleRegenerateItineraries = async () => {
    setIsRegenerating(true)

    try {
      // API 요청 데이터 준비
      const request: KeywordRecommendationRequest = {
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        travelers: tripData.travelers,
        keywords: {
          관광지: tripData.keywords.관광지,
          맛집: tripData.keywords.맛집,
          숙소: tripData.keywords.숙소,
          카페: tripData.keywords.카페,
        },
        numOptions: 2
      }


      // API 호출
      const response = await recommendationService.getKeywordRecommendations(request)
      
      // API 응답이 성공인지 확인
      if (response && response.success === true && response.data) {
        setItineraries(response.data.options)
        
        // 새로운 일정 중 첫 번째를 자동으로 선택
        if (response.data.options.length > 0) {
          setSelectedItinerary(response.data.options[0])
          // 일차 선택 상태 초기화
          setActiveDayA(1)
          setActiveDayB(1)
        }
        
        // 새로운 추천 데이터 저장
        const updatedTripData = {
          ...tripData,
          recommendations: response.data,
        }
        localStorage.setItem("aiTripData", JSON.stringify(updatedTripData))
      } else {
        throw new Error(response?.error?.message || "새로운 추천 요청에 실패했습니다.")
      }
    } catch (error: any) {
      
      // API 실패 시 더미 데이터로 폴백
      const mockResponse = recommendationService.generateMockRecommendations({
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        travelers: tripData.travelers,
        keywords: {
          관광지: tripData.keywords.관광지,
          맛집: tripData.keywords.맛집,
          숙소: tripData.keywords.숙소,
          카페: tripData.keywords.카페,
        },
        numOptions: 2
      })

      setItineraries(mockResponse.data.options)
      
      // 더미 데이터 중 첫 번째를 자동으로 선택
      if (mockResponse.data.options.length > 0) {
        setSelectedItinerary(mockResponse.data.options[0])
        // 일차 선택 상태 초기화
        setActiveDayA(1)
        setActiveDayB(1)
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSelectItinerary = (itinerary: any) => {
    setSelectedItinerary(itinerary)
  }

  const handleConfirmItinerary = () => {
    const updatedTripData = {
      ...tripData,
      selectedItinerary,
    }
    localStorage.setItem("aiTripData", JSON.stringify(updatedTripData))
    router.push("/planning/ai/confirmation")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일 (${weekday})`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "관광지":
        return "text-primary bg-primary/10"
      case "숙소":
        return "text-secondary bg-secondary/10"
      case "맛집":
        return "text-accent bg-accent/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "관광지":
        return "🏛️"
      case "맛집":
        return "🍽️"
      case "카페":
        return "☕"
      case "숙소":
        return "🏨"
      default:
        return "📍"
    }
  }

  if (!tripData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/planning/ai/keywords"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">맞춤 여행 일정을 준비했어요</h1>
          <p className="text-muted-foreground text-lg">선택하신 취향에 맞는 2가지 일정 중 하나를 선택해주세요</p>
        </div>

        <div className="bg-card rounded-lg p-6 mb-12 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">여행 기간</p>
                <p className="font-semibold text-foreground">
                  {formatDate(tripData.startDate)} ~ {formatDate(tripData.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">선택 키워드</p>
                <p className="font-semibold text-foreground text-sm">
                  {Object.entries(tripData.keywords || {})
                    .map(([category, keywords]: [string, any]) => keywords.join(", "))
                    .join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* 좌우 분할 레이아웃: 코스 선택 + 지도 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">여행 코스 선택 및 지도</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 코스 선택 */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">코스 선택</h3>
                <div className="space-y-3">
                  {itineraries.map((itinerary, index) => {
                    const isCourseA = index === 0
                    const isSelected = selectedItinerary?.title === itinerary.title
                    
                    return (
                      <button
                        key={itinerary.id || `course-${index}`}
                        onClick={() => handleSelectItinerary(itinerary)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            isCourseA ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {isCourseA ? 'A' : 'B'}
                          </div>
                          <h4 className="font-semibold text-foreground">{itinerary.title}</h4>
                          {isSelected && <Check className="w-5 h-5 text-primary ml-auto" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {itinerary.days?.length || 0}일 일정 • {itinerary.days?.reduce((total: number, day: any) => total + (day.items?.length || day.places?.length || 0), 0) || 0}개 장소
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* 선택된 코스 상세 정보 */}
              {selectedItinerary && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      selectedItinerary === itineraries[0] ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {selectedItinerary === itineraries[0] ? 'A' : 'B'}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{selectedItinerary.title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedItinerary.days?.map((day: any, dayIndex: number) => (
                      <div key={day.day || dayIndex} className="border-l-4 border-primary/20 pl-4">
                        <h4 className="font-semibold text-foreground mb-2">
                          {day.day || dayIndex + 1}일차
                        </h4>
                        <div className="space-y-2">
                          {(day.items || day.places || []).map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                              <span className="text-lg">
                                {getCategoryIcon(item.category || item.type)}
                              </span>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {item.label || item.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.slot === 'MORNING' ? '오전' : 
                                   item.slot === 'AFTERNOON' ? '오후' : 
                                   item.slot === 'LUNCH' ? '점심' : 
                                   item.slot === 'DINNER' ? '저녁' : 
                                   item.slot === 'LODGING' ? '숙소' : 
                                   item.time || item.slot}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 우측: 선택된 코스의 지도 */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                {selectedItinerary && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    selectedItinerary === itineraries[0] ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {selectedItinerary === itineraries[0] ? 'A' : 'B'}
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground">
                  {selectedItinerary ? `${selectedItinerary.title} 지도` : '여행 지도'}
                </h3>
              </div>
              
              {/* 일차 선택 탭 */}
              {selectedItinerary && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedItinerary.days?.map((day: any) => {
                      const currentActiveDay = selectedItinerary === itineraries[0] ? activeDayA : activeDayB
                      return (
                        <button
                          key={day.day}
                            onClick={() => {
                              if (selectedItinerary === itineraries[0]) {
                                setActiveDayA(day.day)
                              } else {
                                setActiveDayB(day.day)
                              }
                              
                              // 탭 전환 후 강제 resize/relayout + center 재설정
                              setTimeout(() => {
                                // 브라우저에게 resize 알림
                                window.dispatchEvent(new Event('resize'))
                                
                                // 지도 relayout 강제 실행 (전역에서 접근 가능하도록)
                                const mapElement = document.querySelector('.kakao-map-container')
                                if (mapElement && (window as any).kakaoMapInstance) {
                                  try {
                                    (window as any).kakaoMapInstance.relayout && (window as any).kakaoMapInstance.relayout()
                                    const center = new (window as any).kakao.maps.LatLng(33.4996, 126.5312)
                                    (window as any).kakaoMapInstance.setCenter && (window as any).kakaoMapInstance.setCenter(center)
                                  } catch (e) {
                                  }
                                }
                              }, 120)
                            }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            currentActiveDay === day.day
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {day.day}일차
                        </button>
                      )
                    })}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {(selectedItinerary === itineraries[0] ? activeDayA : activeDayB)}일차 장소가 표시됩니다
                  </div>
                </div>
              )}
              
              {/* 지도 영역 - 항상 렌더링 */}
              <div style={{ height: '400px', minHeight: '400px' }}>
                {selectedItinerary ? (
                  <ItineraryMap 
                    itinerary={selectedItinerary} 
                    activeDay={selectedItinerary === itineraries[0] ? (activeDayA || 1) : (activeDayB || 1)}
                    showAllDays={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🗺️</div>
                      <p>좌측에서 코스를 선택하면 지도가 표시됩니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          {selectedItinerary && (
            <Button
              onClick={handleConfirmItinerary}
              className="h-12 px-8 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
            >
              <Check className="w-5 h-5 mr-3" />
              이 일정으로 확정하기
            </Button>
          )}
          
          <Button
            onClick={handleRegenerateItineraries}
            disabled={isRegenerating}
            variant="outline"
            className="h-12 px-8 font-semibold border-border hover:bg-muted transition-all duration-200 bg-transparent"
          >
            {isRegenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-3"></div>
                새로운 일정 생성 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-3" />
                다른 일정 보기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

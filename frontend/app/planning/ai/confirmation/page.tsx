"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Calendar, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tripService } from "@/lib/trip-service"

export default function ConfirmationPage() {
  const router = useRouter()
  const [tripData, setTripData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const savedTripData = localStorage.getItem("aiTripData")
    if (!savedTripData) {
      router.push("/planning/ai")
      return
    }

    const data = JSON.parse(savedTripData)
    if (!data.selectedItinerary) {
      router.push("/planning/ai/result")
      return
    }

    setTripData(data)
  }, [router])

  const handleConfirm = async () => {
    setIsSaving(true)

    try {
      // 서버에 여행 계획 저장
      const selectedPlaces = tripData.selectedItinerary.days.flatMap((day: any, dayIndex: number) =>
        day.items ? day.items
          .filter((item: any) =>
            item.category !== "숙소" && item.slot !== "LODGING"
          )
          .map((item: any) => ({
            dayNumber: dayIndex + 1,
            place: {
              id: item.placeId,
              title: item.label,
              name: item.label,
              contentid: item.placeId,
              address: item.category,
              time: item.slot
            }
          })) : []
      )

      const selectedAccommodations = tripData.selectedItinerary.days.flatMap((day: any, dayIndex: number) =>
        day.items ? day.items
          .filter((item: any) =>
            item.category === "숙소" || item.slot === "LODGING"
          )
          .map((item: any) => ({
            checkInDate: day.date,
            place: {
              id: item.placeId,
              name: item.label,
              contentid: item.placeId,
              address: item.category
            },
            room: {
              price: 0
            }
          })) : []
      )

      // 기존 방식처럼 단계별로 저장
      // 1. 여행 계획 생성
      const tripPlanResponse = await tripService.createTripPlan(
        tripData.selectedItinerary.title || "AI 추천 여행 일정",
        tripData.startDate,
        tripData.endDate
      )
      const tripPlan = tripPlanResponse.data

      // 2. createTripPlan에서 이미 모든 일차가 자동 생성됨

      // 3. AI 일정의 장소들을 각 일차에 추가
      const start = new Date(tripData.startDate)
      const end = new Date(tripData.endDate)
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // 일차별로 장소 추가
      for (let dayIndex = 0; dayIndex < totalDays && dayIndex < tripData.selectedItinerary.days.length; dayIndex++) {
        const day = tripData.selectedItinerary.days[dayIndex]
        const dayDate = new Date(start)
        dayDate.setDate(dayDate.getDate() + dayIndex)
        const dateString = dayDate.toISOString().split("T")[0]

        // 해당 일차의 TripDay ID 조회
        const daysResponse = await tripService.getTripDays(tripPlan.id)
        const tripDay = daysResponse.data.find(d => d.date === dateString)
        
        if (tripDay && day.items && day.items.length > 0) {
          
          // 각 장소를 Destination으로 추가
          for (let itemIndex = 0; itemIndex < day.items.length; itemIndex++) {
            const item = day.items[itemIndex]
            try {
              // 실제 장소명을 사용하여 장소 추가
              await tripService.addDestinationToPlan(
                tripPlan.id,
                tripDay.tripDayId,
                item.placeId || `ai_place_${dayIndex}_${itemIndex}`,
                item.label, // 실제 장소명 사용 (예: "우도", "옥돔구이 전문점")
                item.address || "주소 정보 없음",
                item.category, // 카테고리 (예: "관광지", "맛집", "숙소")
                `${item.slot} - AI 추천 장소`
              )
            } catch (destError) {
            }
          }
        }
      }

      const savedPlan = { data: tripPlan }

      // localStorage에서 AI 데이터만 제거
      localStorage.removeItem("aiTripData")

      // AI 일정 확정 후 내 여행 일정 페이지로 이동
      router.push("/my-itinerary")
    } catch (error) {
      // 에러 발생 시 AI 데이터만 제거하고 에러 페이지로 이동
      localStorage.removeItem("aiTripData")
      alert("여행 계획 저장에 실패했습니다. 다시 시도해주세요.")
      router.push("/planning/ai")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음"
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "날짜 오류"
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일 (${weekday})`
  }

  if (!tripData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const { selectedItinerary } = tripData

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/planning/ai/result"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="이전 페이지로 돌아가기"
          >
            <ChevronLeft size={20} className="mr-1" />
            이전으로
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">일정 확정</h1>
          <p className="text-lg text-muted-foreground">선택하신 여행 일정을 확인하고 저장해보세요</p>
        </div>

        <div className="toss-card p-8 mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{selectedItinerary.title}</h2>
            <p className="text-muted-foreground">{selectedItinerary.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">여행 기간</p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(tripData.startDate)} ~ {formatDate(tripData.endDate)}
                </p>
              </div>
            </div>


            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">여행 일수</p>
                <p className="text-muted-foreground text-sm">{selectedItinerary.days.length}일</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 mb-12">
          {selectedItinerary.days.map((day: any, dayIndex: number) => {
            // 날짜 계산 (startDate 기준으로 dayIndex만큼 더하기)
            const startDate = new Date(tripData.startDate)
            const dayDate = new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000)
            const dateString = dayDate.toISOString().split("T")[0]
            
            return (
            <div key={dayIndex} className="toss-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">
                Day {dayIndex + 1} - {formatDate(dateString)}
              </h3>

              <div className="space-y-6">
                {day.items && day.items.length > 0 ? (
                  day.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {itemIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{item.label}</h4>
                        <p className="text-muted-foreground text-sm mb-1">{item.category}</p>
                        <p className="text-primary text-sm font-medium">
                          {item.slot === 'MORNING' ? '오전' : 
                           item.slot === 'AFTERNOON' ? '오후' : 
                           item.slot === 'LUNCH' ? '점심' : 
                           item.slot === 'DINNER' ? '저녁' : 
                           item.slot === 'LODGING' ? '숙소' : 
                           item.slot}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>등록된 장소가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>

        <div className="text-center">
          <Button onClick={handleConfirm} disabled={isSaving} className="toss-button w-full max-w-md h-14 text-lg">
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-3"></div>
                일정 저장 중...
              </>
            ) : (
              <>
                <Check className="w-6 h-6 mr-3" />
                일정 확정하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

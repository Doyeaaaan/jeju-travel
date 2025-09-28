"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Clock, Plus, Trash2, Share2, AlertCircle, RefreshCw, Users, Copy, Send } from "lucide-react"
import { tripService } from "@/lib/trip-service"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/auth-service"
import { useMyTripPlans, useMyFriends, useSharedPlans } from "@/hooks/use-itinerary"
import type { TripPlanDto } from "@/types/api-types"

// 친구 타입 정의
type FriendLike = {
  friendId?: number | string; // ← 서버가 주는 '대상 사용자 ID'
  id?: number | string;       // 혹시 다른 API에서 쓰는 id
  userId?: number | string;   // 현재 사용자 id가 들어오는 경우도 있어 fallback
  nickname?: string;
};

const extractFriendId = (f: FriendLike | number | string | null | undefined): number | null => {
  if (f == null) return null;
  if (typeof f === "number") return Number.isFinite(f) ? f : null;
  if (typeof f === "string") {
    const n = Number(f);
    return Number.isFinite(n) ? n : null;
  }
  // 백엔드는 userId를 기대하므로 userId를 우선적으로 사용
  const cand = (f.userId ?? f.friendId ?? f.id) as number | string | undefined;
  const n = Number(cand);
  return Number.isFinite(n) ? n : null;
};

const friendKey = (f: FriendLike) => {
  const id = extractFriendId(f);
  return id != null ? `friend-${id}` : `friend-${String(f.nickname ?? "")}-${Math.random().toString(36).slice(2,7)}`;
};
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import PlanDetailModal from "@/components/PlanDetailModal"

export default function MyItineraryPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  // 실제 API 데이터 훅 사용 (수정된 훅 이름)
  const { data: tripPlansData, loading: tripPlansLoading, error: tripPlansError, refetch: refetchTripPlans } = useMyTripPlans()
  const { data: friendsData, loading: friendsLoading, error: friendsError } = useMyFriends()
  // useShareTripPlan 훅 제거 - 직접 API 호출 사용
  const { data: sharedItineraries, loading: sharedItinerariesLoading, error: sharedItinerariesError } = useSharedPlans()
  
  const [tripPlans, setTripPlans] = useState<TripPlanDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<TripPlanDto | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [tripDays, setTripDays] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTrip, setShareTrip] = useState<TripPlanDto | null>(null)
  const [selectedFriends, setSelectedFriends] = useState<number[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [friendSearch, setFriendSearch] = useState("")
  const [shareLoading, setShareLoading] = useState(false)

  // 새로운 API 훅 데이터를 기존 상태와 동기화
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // 새로운 API 훅 데이터로 업데이트
    if (tripPlansData) {
      // MyTripPlan 타입을 기존 TripPlanDto 호환 형태로 변환
      const convertedTripPlans = tripPlansData.map(plan => ({
        ...plan,
        id: plan.tripPlanId || plan.id, // 백엔드의 tripPlanId를 id로 매핑
        tripPlanId: plan.tripPlanId || plan.id, // 기존 코드 호환성을 위해 유지
        days: [], // 기본값
      }))
      setTripPlans(convertedTripPlans as any[])
      setLoading(tripPlansLoading)
      setError(tripPlansError)
    }
  }, [isAuthenticated, authLoading, tripPlansData, tripPlansLoading, tripPlansError])

  // 기존 loadUserTripPlans 함수를 새로운 API 훅의 refetch로 대체
  const loadUserTripPlans = async () => {
    try {
      await refetchTripPlans()
    } catch (error: any) {
      setError(error.message || "여행 계획을 불러오는 중 오류가 발생했습니다.")
    }
  }

  const handleRetry = async () => {
    await loadUserTripPlans()
  }

  const refreshPlanDetails = async () => {
    if (!selectedTrip) return

    setDetailLoading(true)
    try {
      const planId = selectedTrip.id || selectedTrip.tripPlanId
      
      if (!planId) {
        toast({
          title: "실패",
          description: "여행 계획 ID를 찾을 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      const response = await tripService.getPlanDays(planId)
      setTripDays(response.data)
    } catch (error: any) {
      toast({
        title: "오류",
        description: "최신 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleShare = async (trip: TripPlanDto) => {
    setShareTrip(trip)
    setShowShareModal(true)
    // 실제 친구 데이터 사용 (이미 useMyFriends 훅에서 로드됨)
    setFriends(friendsData || [])
  }

  const handleShareSubmit = async () => {
    
    if (!shareTrip) {
      toast({
        title: "오류",
        description: "공유할 일정을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    // (F) 공유 제출 직전: 정규화 + 필터링 + 중복 제거 (friendId 기준)
    const normalized = Array.from(new Set(
      (selectedFriends ?? []).map((v) => Number(v)).filter((n) => Number.isFinite(n))
    )) as number[];

    if (normalized.length === 0) {
      toast({ 
        title: "공유할 친구를 선택해주세요.", 
        variant: "destructive" 
      });
      return;
    }

      url: `/api/trip-plans/${shareTrip.id}/share-with-friend`,
      method: "POST",
      body: { friendId: normalized[0], permission: "READ_ONLY" },
      bodyStringified: JSON.stringify({ friendId: normalized[0], permission: "READ_ONLY" }),
      note: `friendId: ${normalized[0]} (이 값이 백엔드의 User 테이블 ID여야 함)`
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/api/trip-plans/${shareTrip.id}/share-with-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          friendId: normalized[0], // 첫 번째 친구에게만 공유 (백엔드 API 스펙에 맞춤)
          permission: "READ_ONLY" // ✅ SharePermission enum 값: READ_ONLY / CAN_EDIT
        })
      });

      const responseData = await res.json();
      
      if (!res.ok) {
          status: res.status,
          statusText: res.statusText,
          responseData: responseData,
          error: responseData.error
        });
        throw new Error(`HTTP ${res.status}: ${responseData.error?.message || responseData.message || res.statusText}`);
      }

      // 백엔드 응답 구조에 맞춰 처리
      if (responseData.status === '200 OK' || res.status === 200 || res.status === 201) {
        // 성공 응답
        toast({ 
          title: "공유 완료", 
          description: `${normalized.length}명에게 공유했습니다.` 
        });
      } else {
        // 실패 응답
        toast({
          title: "공유 실패",
          description: responseData.message || "공유 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }

      setShowShareModal(false)
      setSelectedFriends([])
    } catch (e: any) {
      toast({ 
        title: "공유 실패", 
        description: e?.message || "오류가 발생했습니다.", 
        variant: "destructive" 
      });
    }
  }

  const handleDeleteTrip = async (tripId: number, tripName: string) => {
    if (!confirm(`정말로 "${tripName}" 여행 계획을 삭제하시겠습니까?`)) {
      return
    }

    try {
      await tripService.deleteTripPlan(tripId)

      setTripPlans((prev) => prev.filter((trip) => trip.id !== tripId))

      alert("여행 계획이 삭제되었습니다.")
    } catch (error: any) {
      alert(error.message || "여행 계획 삭제에 실패했습니다.")
    }
  }

  const handleViewDetails = (trip: TripPlanDto) => {
    setSelectedTrip(trip)
    setShowDetailsModal(true)
    setEditMode(false)
  }

  const handleEditDay = (tripId: number, dayDate: string) => {
    setShowDetailsModal(false)
    router.push(`/planning/flow/itinerary-confirmation?tripPlanId=${tripId}&selectedDate=${dayDate}`)
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

  const getTripDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const startPart = startDate.split('T')[0]
      const endPart = endDate.split('T')[0]
      const [startYear, startMonth, startDay] = startPart.split('-').map(Number)
      const [endYear, endMonth, endDay] = endPart.split('-').map(Number)
      
      const start = new Date(startYear, startMonth - 1, startDay)
      const end = new Date(endYear, endMonth - 1, endDay)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } catch (e) {
      return 1
    }
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    try {
      // 시간대 문제를 피하기 위해 날짜 부분만 추출
      const datePart = dateString.split('T')[0]
      const [year, month, day] = datePart.split('-').map(Number)
      return `${month}월 ${day}일 (${getDayOfWeek(dateString)})`
    } catch (e) {
      return dateString
    }
  }

  const generateDateList = (startDate: string, endDate: string) => {
    const dates = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0])
    }

    return dates
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nickname.toLowerCase().includes(friendSearch.toLowerCase()) ||
      friend.email.toLowerCase().includes(friendSearch.toLowerCase()),
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">인증 확인 중...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">여행 계획을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-foreground">
                재곰제곰
              </Link>
              <div className="ml-8">
                <h1 className="text-xl font-semibold text-foreground">내 여행 계획</h1>
              </div>
            </div>
            <Link
              href="/planning/flow/date-selection"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-2xl hover:shadow-md transition-all duration-200"
            >
              <Plus size={20} className="mr-2" />새 여행 계획
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 bg-transparent">
                <RefreshCw size={16} className="mr-1" />
                다시 시도
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">여행 계획을 불러오는 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        ) : tripPlans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <MapPin size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error ? "여행 계획을 불러올 수 없습니다" : "아직 여행 계획이 없습니다"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {error ? "다시 시도하거나 새로운 여행 계획을 만들어보세요!" : "첫 번째 여행 계획을 만들어보세요!"}
            </p>
            <div className="flex gap-4 justify-center">
              {error && (
                <Button variant="outline" onClick={handleRetry} className="inline-flex items-center bg-transparent">
                  <RefreshCw size={20} className="mr-2" />
                  다시 시도
                </Button>
              )}
              <Link
                href="/planning/flow/date-selection"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-2xl hover:shadow-md transition-all duration-200"
              >
                <Plus size={20} className="mr-2" />
                여행 계획 만들기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripPlans.map((trip) => (
              <div
                key={trip.id}
                className="toss-card p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <button
                    onClick={() => handleShare(trip)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="공유"
                    aria-label="여행 계획 공유"
                  >
                    <Share2 size={16} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 text-balance">
                    제주도 여행 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar size={16} className="mr-3 text-primary" />
                      <span className="text-sm font-medium">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock size={16} className="mr-3 text-primary" />
                      <span className="text-sm font-medium">총 {getTripDuration(trip.startDate, trip.endDate)}일</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleViewDetails(trip)
                    }}
                    className="flex-1 bg-[#FFA07A] hover:bg-[#FFA07A]/90 text-white text-center py-2 px-3 rounded-xl hover:shadow-md transition-all duration-200 text-sm font-medium"
                  >
                    자세히 보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteTrip((trip as any).tripPlanId || trip.id, trip.planName)
                    }}
                    className="p-3 border border-border rounded-xl hover:bg-muted transition-colors"
                    title="여행 계획 삭제"
                    aria-label="여행 삭제"
                  >
                    <Trash2 size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 공유된 일정이 없을 때 */}
        {!sharedItinerariesLoading && sharedItineraries && sharedItineraries.length === 0 && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Users size={24} className="text-primary mr-3" />
              <h2 className="text-2xl font-bold text-foreground">나와 공유된 일정</h2>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Users size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">아직 나와 공유된 일정이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">친구가 여행 계획을 공유하면 여기에 표시됩니다.</p>
            </div>
          </div>
        )}

        {/* 공유된 일정 로딩 상태 */}
        {sharedItinerariesLoading && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Users size={24} className="text-primary mr-3" />
              <h2 className="text-2xl font-bold text-foreground">나와 공유된 일정</h2>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">공유된 일정을 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 공유된 일정 섹션 */}
        {!sharedItinerariesLoading && sharedItineraries && sharedItineraries.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Users size={24} className="text-primary mr-3" />
              <h2 className="text-2xl font-bold text-foreground">나와 공유된 일정</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedItineraries.map((sharedTrip, index) => (
                <div
                  key={sharedTrip.id || `shared-${index}`}
                  className="toss-card p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full border-2 border-primary/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      공유됨
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 text-balance">{sharedTrip.planName}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar size={16} className="mr-3 text-primary" />
                        <span className="text-sm font-medium">
                          {formatDate(sharedTrip.startDate)} - {formatDate(sharedTrip.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock size={16} className="mr-3 text-primary" />
                        <span className="text-sm font-medium">총 {getTripDuration(sharedTrip.startDate, sharedTrip.endDate)}일</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin size={16} className="mr-3 text-primary" />
                        <span className="text-sm font-medium">여행지 정보</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users size={16} className="mr-3 text-primary" />
                        <span className="text-sm font-medium">공유자: {sharedTrip.ownerName || sharedTrip.sharedBy || "공유자"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleViewDetails(sharedTrip)
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white text-center py-2 px-3 rounded-xl hover:shadow-md transition-all duration-200 text-sm font-medium"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showShareModal && shareTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">여행 계획 공유</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    제주도 여행 {formatDate(shareTrip.startDate)}–{formatDate(shareTrip.endDate)}
                  </p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={shareLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Input
                      placeholder="친구 검색…"
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      className="toss-input focus:ring-[#FF6B2C] focus:border-[#FF6B2C]"
                    />
                  </div>
                </div>

                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">공유할 수 있는 친구가 없습니다.</p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredFriends
                      // 중복 제거 + friendId 통일
                      .reduce<FriendLike[]>((acc, cur) => {
                        const id = extractFriendId(cur);
                        if (id == null) return acc;
                        if (!acc.some(a => extractFriendId(a) === id)) acc.push({ ...cur, userId: id }); // userId로 통일
                        return acc;
                      }, [])
                      .map((friend) => {
                        const fid = extractFriendId(friend); // 항상 number
                        const isSelected = fid != null && selectedFriends.includes(fid);
                        return (
                          <div
                            key={friendKey(friend)}                 // ✅ 안정적 key
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
                              isSelected ? "bg-muted" : "hover:bg-muted/60"
                            }`}
                            onClick={() => {
                              if (fid == null) return;
                              setSelectedFriends((prev) =>
                                prev.includes(fid) ? prev.filter((x) => x !== fid) : [...prev, fid]
                              );
                            }}
                            role="button"
                            aria-pressed={isSelected}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="data-[state=checked]:bg-[#FF6B2C] data-[state=checked]:border-[#FF6B2C]"
                              readOnly
                            />
                            <div className="w-10 h-10 rounded-full bg-[#FF6B2C]/10 flex items-center justify-center">
                              <span className="text-[#FF6B2C] font-medium text-sm">{friend.nickname?.[0] || "?"}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{friend.nickname}</div>
                              <div className="text-xs text-muted-foreground">ID: {fid ?? "-"}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">선택 {selectedFriends.length}명</span>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowShareModal(false)}
                    disabled={shareLoading}
                    className="rounded-xl"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleShareSubmit}
                    disabled={selectedFriends.length === 0 || shareLoading}
                    className="bg-[#FF6B2C] hover:bg-[#FF6B2C]/90 text-white rounded-xl"
                  >
                    {shareLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        공유 중...
                      </>
                    ) : (
                      <>공유하기</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새로운 플랜 상세 모달 */}
      <PlanDetailModal
        trip={selectedTrip}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedTrip(null)
          setEditMode(false)
        }}
      />
    </div>
  )
}

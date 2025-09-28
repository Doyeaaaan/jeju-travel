"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Plus, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { tripService } from "@/lib/trip-service"
import { authService } from "@/lib/auth-service"

interface TripPlan {
  id: number
  planName: string
  startDate: string
  endDate: string
  days: any[]
  createdAt?: string
  updatedAt?: string
}

export default function SchedulesPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [currentTab, setCurrentTab] = useState("completed")
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 로그인 상태 확인
    const user = authService.getCurrentUser()
    setIsLoggedIn(!!user)

    if (user) {
      loadTripPlans()
    } else {
      setLoading(false)
    }
  }, [])

  const loadTripPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await tripService.getUserTripPlans()

      setTripPlans(response.data || [])
    } catch (error: any) {
      setError(error.message || "여행 계획을 불러오는 중 오류가 발생했습니다.")
      setTripPlans([])
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const handleLogin = async () => {
    // 실제 로그인 로직 구현 필요
    setIsLoggedIn(true)
    setShowLoginModal(false)
    await loadTripPlans()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">재곰제곰</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 hover:bg-white/30 transition-colors"
                  onClick={() => setShowLoginModal(true)}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt="프로필"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">김재곤</span>
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="font-medium text-white border-white/20 hover:bg-white/10 bg-transparent"
                onClick={() => setShowLoginModal(true)}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>홈으로 돌아가기</span>
          </Link>
          <h1 className="text-4xl font-bold text-black mb-2">내 여행 일정</h1>
          <p className="text-gray-600">완성된 제주도 여행 일정을 확인하고 관리하세요</p>
        </div>

        {!isLoggedIn ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="h-12 w-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-6">여행 일정을 확인하려면 로그인해주세요</p>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              onClick={() => setShowLoginModal(true)}
            >
              로그인하기
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="completed" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="bg-white border p-1 rounded-full mb-8">
              <TabsTrigger
                value="completed"
                className="px-6 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-full"
              >
                완성된 일정
              </TabsTrigger>
              <TabsTrigger
                value="planning"
                className="px-6 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-full"
              >
                계획 중
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="px-6 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-full"
              >
                지난 여행
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-6 mt-6">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CalendarDays className="h-12 w-12 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">여행 일정을 불러오는 중...</h3>
                  <p className="text-gray-600">잠시만 기다려주세요</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays className="h-12 w-12 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">오류가 발생했습니다</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3" onClick={loadTripPlans}>
                    다시 시도
                  </Button>
                </div>
              ) : tripPlans.length > 0 ? (
                <div className="space-y-6">
                  {tripPlans.map((plan) => {
                    const totalDays = calculateDays(plan.startDate, plan.endDate)

                    return (
                      <div
                        key={plan.id}
                        className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
                      >
                        {/* 일정 헤더 */}
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-2xl font-bold mb-2">🍊 {plan.planName}</h2>
                              <div className="flex items-center gap-4 text-orange-100">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>
                                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{totalDays}일 일정</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold">{totalDays}</div>
                              <div className="text-sm text-orange-100">일차</div>
                            </div>
                          </div>
                        </div>

                        {/* 일정 요약 */}
                        <div className="p-6 bg-orange-50 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{plan.days?.length || 0}</div>
                              <div className="text-sm text-gray-600">등록된 일정</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">0</div>
                              <div className="text-sm text-gray-600">선택한 숙소</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">미설정</div>
                              <div className="text-sm text-gray-600">예산</div>
                            </div>
                          </div>
                        </div>

                        {/* 일차별 일정 */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-gray-800">📅 일차별 일정</h3>

                          {Array.from({ length: totalDays }, (_, index) => {
                            const dayNumber = index + 1

                            return (
                              <div key={dayNumber} className="mb-6 last:mb-0">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {dayNumber}
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-800">{dayNumber}일차 (0개 장소)</h4>
                                </div>

                                <div className="space-y-3 ml-11">
                                  <div className="text-center py-8 text-gray-500">
                                    <p>이 날은 아직 계획된 일정이 없습니다.</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                          <Link href={`/schedules/${plan.id}`} className="flex-1">
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                              상세 일정 보기
                            </Button>
                          </Link>
                          <Link href="/planning/flow/date-selection" className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              일정 수정하기
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="px-6 border-gray-300 hover:bg-gray-100 bg-transparent"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: plan.planName,
                                  text: "제주도 여행 일정을 공유합니다!",
                                  url: window.location.href,
                                })
                              } else {
                                navigator.clipboard.writeText(window.location.href)
                                alert("링크가 복사되었습니다!")
                              }
                            }}
                          >
                            공유하기
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays className="h-12 w-12 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">완성된 일정이 없습니다</h3>
                  <p className="text-gray-600 mb-6">새로운 제주도 여행 일정을 만들어보세요!</p>
                  <Link href="/planning/flow/date-selection">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                      <Plus className="mr-2 h-5 w-5" />새 일정 만들기
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="planning" className="space-y-6 mt-6">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">계획 중인 일정이 없습니다</h3>
                <p className="text-gray-600 mb-6">새로운 여행 계획을 시작해보세요!</p>
                <Link href="/planning/flow/date-selection">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                    <Plus className="mr-2 h-5 w-5" />
                    여행 계획 시작하기
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="past" className="space-y-6 mt-6">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">지난 여행이 없습니다</h3>
                <p className="text-gray-600">아직 완료된 여행이 없습니다.</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">계정</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex border-b mb-6">
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === "login" ? "border-b-2 border-orange-500 font-medium" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("login")}
              >
                로그인
              </button>
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === "signup" ? "border-b-2 border-orange-500 font-medium" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                회원가입
              </button>
            </div>

            {/* 로그인 폼 */}
            {activeTab === "login" && (
              <div>
                <form className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">이메일</label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="이메일 주소를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">비밀번호</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="비밀번호를 입력하세요"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input type="checkbox" id="remember" className="mr-2" />
                      <label htmlFor="remember" className="text-sm text-gray-600">
                        로그인 상태 유지
                      </label>
                    </div>
                    <a href="#" className="text-sm text-gray-600 hover:underline">
                      비밀번호 찾기
                    </a>
                  </div>
                  <Button
                    type="button"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg"
                    onClick={handleLogin}
                  >
                    로그인
                  </Button>
                </form>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full py-3 border border-[#FEE500] bg-[#FEE500] rounded-lg font-medium flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=20&width=20"
                      alt="카카오 로고"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    카카오로 로그인
                  </button>
                  <button className="w-full py-3 border border-gray-300 rounded-lg font-medium flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=20&width=20"
                      alt="구글 로고"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    구글로 로그인
                  </button>
                </div>
              </div>
            )}

            {/* 회원가입 폼 */}
            {activeTab === "signup" && (
              <div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">이메일</label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="abc@naver.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">비밀번호</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="8자 이상"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="위 비밀번호와 동일하게 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">닉네임</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="닉네임 입력"
                    />
                  </div>
                  <Button type="button" className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg">
                    회원가입
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

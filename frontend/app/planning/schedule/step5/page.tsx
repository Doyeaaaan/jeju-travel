"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Home, Calendar } from "lucide-react"

export default function PlanningStep5Page() {
  const router = useRouter()
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [tripStartDate, setTripStartDate] = useState("")
  const [tripEndDate, setTripEndDate] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user?.email) {
      alert("로그인이 필요합니다.")
      router.replace("/login")
      return
    }
    setUserEmail(user.email)

    const prefix = (key: string) => `${key}-${user.email}`
    const storedStartDate = localStorage.getItem(prefix("tripStartDate"))
    const storedEndDate = localStorage.getItem(prefix("tripEndDate"))

    if (storedStartDate) {
      setTripStartDate(storedStartDate)
      setSelectedDate(storedStartDate)
    }
    if (storedEndDate) {
      setTripEndDate(storedEndDate)
    }
  }, [router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`
  }

  const accommodations = [
    {
      id: "harmony",
      name: "함덕 화산송이",
      description: "제주 함덕 단독 펜션",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "wellness",
      name: "윌정스테이",
      description: "월정리 한틀목 펜션",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "sweet",
      name: "스위트호텔 제주",
      description: "대한민국 제주특별자치도 서귀포시",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "maison",
      name: "메종 글래드 제주",
      description: "대한민국 제주시 KR특별자치도",
      image: "/placeholder.svg?height=120&width=200",
    },
  ]

  const handleNext = () => {
    if (selectedAccommodation && userEmail) {
      localStorage.setItem(`selectedAccommodation-${userEmail}`, selectedAccommodation)
      localStorage.setItem(`accommodationDate-${userEmail}`, selectedDate || "")
      router.push("/planning/schedule/step6")
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="p-4 border-b flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">제공제공</Link>
        <div className="flex items-center gap-4">
          <Link href="/mypage" className="text-sm">마이페이지</Link>
          <Link href="/login" className="text-sm">로그인</Link>
        </div>
      </div>

      {/* 진행 상태 표시 */}
      <div className="bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {["여행 기간", "여행 스타일", "장소 선택", "일정 확인"].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Check size={16} />
                </div>
                <span className="text-xs mt-1 font-medium">{label}</span>
                {index < 3 && <div className="flex-1 h-1 bg-orange-500 mx-2 w-full" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-8 max-w-2xl mx-auto">
        <Link href="/planning/schedule/step4" className="flex items-center text-gray-500 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          이전 단계
        </Link>

        <h1 className="text-2xl font-bold mb-8">숙박하실 날짜를 선택해주세요</h1>

        {/* 날짜 선택 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar size={24} className="text-orange-500 mr-3" />
            <h2 className="text-lg font-bold">숙박 날짜</h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex justify-center space-x-4">
              {tripStartDate && (
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedDate === tripStartDate ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedDate(tripStartDate)}
                >
                  {formatDate(tripStartDate)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 숙소 선택 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Home size={24} className="text-orange-500 mr-3" />
            <h2 className="text-lg font-bold">숙소 선택</h2>
          </div>

          <div className="space-y-4">
            {accommodations.map((accommodation) => (
              <div
                key={accommodation.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all flex ${
                  selectedAccommodation === accommodation.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
                onClick={() => setSelectedAccommodation(accommodation.id)}
              >
                <div className="w-24 h-20 relative rounded-md overflow-hidden mr-4">
                  <Image
                    src={accommodation.image || "/placeholder.svg"}
                    alt={accommodation.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{accommodation.name}</h3>
                  <p className="text-sm text-gray-600">{accommodation.description}</p>
                </div>
                <div className="ml-2">
                  {selectedAccommodation === accommodation.id ? (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Link href="/planning/schedule/step4" className="px-6 py-2 border rounded-md">
            이전
          </Link>
          <button
            onClick={handleNext}
            disabled={!selectedAccommodation || !selectedDate}
            className={`flex items-center px-6 py-2 rounded-md ${
              selectedAccommodation && selectedDate
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  )
}

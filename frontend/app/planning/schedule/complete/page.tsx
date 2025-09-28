"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Car, Share2, Download } from "lucide-react"
import { accommodations } from "@/data/accommodations"

export default function PlanningCompletePage() {
  const router = useRouter()
  const [tripStartDate, setTripStartDate] = useState("")
  const [tripEndDate, setTripEndDate] = useState("")
  const [selectedAccommodation, setSelectedAccommodation] = useState<number | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeTab, setActiveTab] = useState("전체일정")

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const storedStartDate = localStorage.getItem("tripStartDate")
    const storedEndDate = localStorage.getItem("tripEndDate")
    const storedAccommodation = localStorage.getItem("selectedAccommodation")

    if (storedStartDate) setTripStartDate(storedStartDate)
    if (storedEndDate) setTripEndDate(storedEndDate)
    if (storedAccommodation) setSelectedAccommodation(Number(storedAccommodation))
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 일정 데이터 (실제로는 API에서 가져올 데이터)
  const schedule = [
    {
      day: 1,
      date: tripStartDate,
      places: [
        {
          id: 1,
          name: "제주국제공항",
          time: "10:37-10:37",
          type: "명소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 2,
          name: accommodations.find((a) => a.id === selectedAccommodation)?.name || "함덕 화산송이",
          time: "11:25-11:25",
          type: "숙소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 3,
          name: "안녕,전복 Hi, Abalone",
          time: "12:13-14:13",
          type: "식당",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 4,
          name: "제주동문시장",
          time: "17:38-19:38",
          type: "명소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 5,
          name: "금돈 흑돼지",
          time: "20:00-22:00",
          type: "식당",
          image: "/placeholder.svg?height=64&width=64",
        },
      ],
    },
    {
      day: 2,
      date: tripEndDate,
      places: [
        {
          id: 6,
          name: accommodations.find((a) => a.id === selectedAccommodation)?.name || "함덕 화산송이",
          time: "16:04-16:04",
          type: "숙소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 7,
          name: "섭지코지",
          time: "16:55-18:55",
          type: "명소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 8,
          name: "성산 일출봉",
          time: "20:00-22:00",
          type: "명소",
          image: "/placeholder.svg?height=64&width=64",
        },
        {
          id: 9,
          name: accommodations.find((a) => a.id === selectedAccommodation)?.name || "함덕 화산송이",
          time: "22:50-22:50",
          type: "숙소",
          image: "/placeholder.svg?height=64&width=64",
        },
      ],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="p-4 border-b flex items-center">
        <Link href="/" className="mr-4">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="로고"
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
        </Link>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="일정 검색"
            className="w-full p-2 pl-10 pr-4 border rounded-full bg-gray-100"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-2 border rounded-md flex items-center">
            <Download size={16} className="mr-2" />
            저장
          </button>
          <button className="px-4 py-2 border rounded-md flex items-center">
            <Share2 size={16} className="mr-2" />
            공유
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b">
        <div className="flex">
          <button
            className={`py-3 px-6 ${
              activeTab === "전체일정" ? "border-b-2 border-black font-medium" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("전체일정")}
          >
            전체일정
          </button>
          <button
            className={`py-3 px-6 ${activeTab === "항공권" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("항공권")}
          >
            항공권
          </button>
          <button
            className={`py-3 px-6 ${activeTab === "숙소" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("숙소")}
          >
            숙소
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex">
        {/* 왼쪽 패널 - 일정 목록 */}
        <div className="w-1/2 overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
          <div className="p-4">
            {schedule.map((day) => (
              <div key={day.day} className="mb-8">
                <h2 className="text-lg font-bold mb-2">{day.day}일차</h2>
                <div className="text-sm text-gray-500 mb-4">{formatDate(day.date)}</div>

                {day.places.map((place, index) => (
                  <div key={place.id} className="mb-4">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 ${
                          place.type === "명소"
                            ? "bg-blue-500"
                            : place.type === "식당"
                              ? "bg-red-500"
                              : place.type === "숙소"
                                ? "bg-purple-500"
                                : "bg-gray-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="text-sm text-gray-500">{place.time}</div>
                    </div>
                    <div className="ml-11 mt-2 flex">
                      <div className="w-16 h-16 relative rounded-md overflow-hidden mr-4">
                        <Image
                          src={place.image || "/placeholder.svg?height=64&width=64"}
                          alt={place.name}
                          fill
                          className="object-cover"
                        />
                        <div
                          className={`absolute top-0 left-0 text-white text-xs px-1 
                          ${
                            place.type === "명소"
                              ? "bg-blue-500"
                              : place.type === "식당"
                                ? "bg-red-500"
                                : place.type === "숙소"
                                  ? "bg-purple-500"
                                  : "bg-gray-500"
                          }`}
                        >
                          {place.type}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{place.name}</h3>
                        {index < day.places.length - 1 && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Car size={14} className="mr-1" />
                            <span>48분</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < day.places.length - 1 && (
                      <div className="ml-11 h-8 border-l-2 border-dashed border-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 패널 - 지도 */}
        <div className="w-1/2 relative">
          <div className="h-[calc(100vh-130px)] bg-gray-200 flex items-center justify-center">
            <div className="text-center text-3xl text-gray-400 font-bold">지도</div>
          </div>

          {/* 일정 저장 버튼 */}
          <div className="absolute bottom-4 right-4">
            <button onClick={() => setShowLoginModal(true)} className="px-6 py-3 rounded-md bg-blue-500 text-white">
              일정 생성
            </button>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <p className="text-center mb-6">일정을 저장하시려면 로그인이 필요합니다.</p>
            <p className="text-center mb-6">로그인 페이지로 이동하시겠습니까?</p>

            <div className="flex justify-between">
              <button className="px-6 py-2 border rounded-md" onClick={() => setShowLoginModal(false)}>
                취소
              </button>
              <Link href="/login">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-md">로그인 페이지로 이동</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

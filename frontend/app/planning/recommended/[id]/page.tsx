"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, ArrowRight, ChevronLeft, Star, Download, Share2, Car } from "lucide-react"

export default function RecommendedCourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const courseId = Number(params.id)
  const [activeDay, setActiveDay] = useState(1)

  // 추천 코스 데이터 (실제로는 API에서 가져올 것)
  const course = {
    id: courseId,
    title: "제주 동부 2박 3일 코스",
    description: "성산일출봉, 우도, 만장굴 등 제주 동부의 아름다운 명소들을 둘러보는 코스",
    image: "/placeholder.svg?height=400&width=800",
    days: 3,
    nights: 2,
    region: "east",
    rating: 4.8,
    reviewCount: 256,
    highlights: ["성산일출봉", "우도", "만장굴", "함덕해수욕장"],
    tags: ["자연", "바다", "유네스코"],
    itinerary: [
      {
        day: 1,
        title: "제주 도착 및 동부 탐방",
        description: "제주 공항에 도착하여 렌트카를 수령한 후 동부 지역의 주요 명소를 방문합니다.",
        places: [
          {
            name: "제주국제공항",
            type: "airport",
            time: "10:00-11:00",
            description: "제주공항 도착 및 렌트카 수령",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "함덕 해수욕장",
            type: "beach",
            time: "12:00-14:00",
            description: "에메랄드빛 바다가 아름다운 함덕 해수욕장에서 점심 식사 및 해변 산책",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "만장굴",
            type: "attraction",
            time: "15:00-16:30",
            description: "세계적으로 유명한 용암동굴인 만장굴 탐험",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "제주 동부 리조트",
            type: "accommodation",
            time: "18:00-19:00",
            description: "숙소 체크인 및 휴식",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "동부 해안도로 맛집",
            type: "restaurant",
            time: "19:30-21:00",
            description: "신선한 해산물을 즐길 수 있는 맛집에서 저녁 식사",
            image: "/placeholder.svg?height=80&width=80",
          },
        ],
      },
      {
        day: 2,
        title: "우도 및 성산일출봉",
        description: "아름다운 우도와 유네스코 세계자연유산인 성산일출봉을 방문합니다.",
        places: [
          {
            name: "성산항",
            type: "port",
            time: "09:00-09:30",
            description: "성산항에서 우도행 페리 탑승",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "우도",
            type: "island",
            time: "10:00-15:00",
            description: "우도에서 자전거 투어 및 점심 식사",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "성산일출봉",
            type: "attraction",
            time: "16:00-18:00",
            description: "유네스코 세계자연유산인 성산일출봉 등반",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "제주 동부 리조트",
            type: "accommodation",
            time: "19:00-20:00",
            description: "숙소 복귀 및 휴식",
            image: "/placeholder.svg?height=80&width=80",
          },
        ],
      },
      {
        day: 3,
        title: "제주 동부 마무리 및 출발",
        description: "제주 동부의 마지막 명소를 방문한 후 공항으로 이동합니다.",
        places: [
          {
            name: "섭지코지",
            type: "attraction",
            time: "09:00-11:00",
            description: "아름다운 해안 절벽이 있는 섭지코지 방문",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "성읍민속마을",
            type: "attraction",
            time: "12:00-14:00",
            description: "전통 민속마을 방문 및 점심 식사",
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            name: "제주국제공항",
            type: "airport",
            time: "16:00-17:00",
            description: "렌트카 반납 및 공항 도착",
            image: "/placeholder.svg?height=80&width=80",
          },
        ],
      },
    ],
  }

  const handleApplyCourse = () => {
    alert("이 코스를 내 여행 계획에 적용했습니다!")
    router.push("/planning/flow/date-selection")
  }

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen flex">
      {/* 왼쪽 패널 - 코스 상세 */}
      <div className="w-2/3 border-r">
        {/* 헤더 */}
        <div className="p-4 border-b flex items-center bg-black text-white">
          <Link href="/planning/recommended" className="flex items-center text-gray-300 hover:text-white">
            <ChevronLeft size={18} className="mr-1" />
            추천 코스 목록
          </Link>
        </div>

        {/* 코스 헤더 */}
        <div className="relative h-64">
          <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex items-center mb-2">
              <Star className="text-yellow-500" size={16} />
              <span className="ml-1 font-medium">{course.rating}</span>
              <span className="text-sm ml-1">({course.reviewCount})</span>
              <span className="mx-2">•</span>
              <span>
                {course.nights}박 {course.days}일
              </span>
            </div>
            <div className="flex gap-2">
              {course.tags.map((tag, index) => (
                <span key={index} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 코스 설명 */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-2">코스 소개</h2>
          <p className="text-gray-600">{course.description}</p>
          <div className="mt-4">
            <h3 className="font-medium mb-2">주요 방문지</h3>
            <div className="flex flex-wrap gap-2">
              {course.highlights.map((highlight, index) => (
                <span key={index} className="bg-gray-100 text-sm px-3 py-1 rounded-full">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 일자 탭 */}
        <div className="flex border-b overflow-x-auto bg-gray-100">
          {course.itinerary.map((day) => (
            <button
              key={day.day}
              className={`px-6 py-3 whitespace-nowrap ${
                activeDay === day.day ? "border-b-2 border-black font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveDay(day.day)}
            >
              {day.day}일차
            </button>
          ))}
        </div>

        {/* 일정 내용 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 500px)" }}>
          {course.itinerary
            .filter((day) => day.day === activeDay)
            .map((day) => (
              <div key={day.day}>
                <h2 className="text-xl font-bold mb-2">
                  {day.day}일차: {day.title}
                </h2>
                <p className="text-gray-600 mb-6">{day.description}</p>

                <div className="space-y-6">
                  {day.places.map((place, index, array) => (
                    <div key={index} className="relative">
                      <div className="flex">
                        <div className="mr-4 relative">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                            style={{
                              backgroundColor:
                                place.type === "accommodation"
                                  ? "#000000"
                                  : place.type === "restaurant"
                                    ? "#333333"
                                    : place.type === "beach"
                                      ? "#555555"
                                      : place.type === "attraction"
                                        ? "#777777"
                                        : "#999999",
                            }}
                          >
                            {index + 1}
                          </div>
                          {index < array.length - 1 && (
                            <div className="absolute top-10 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{place.name}</h3>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Clock size={14} className="mr-1" />
                                <span>{place.time}</span>
                              </div>
                            </div>
                            <div className="w-16 h-16 relative rounded-md overflow-hidden">
                              <Image
                                src={place.image || "/placeholder.svg"}
                                alt={place.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{place.description}</p>

                          {index < array.length - 1 && (
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <Car size={14} className="mr-1" />
                              <span>이동 시간: 약 30분</span>
                              <ArrowRight size={14} className="mx-2" />
                              <span>다음 장소: {array[index + 1].name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t flex justify-between bg-gray-50">
          <Link
            href="/planning/recommended"
            className="px-6 py-2 border rounded-md flex items-center hover:bg-gray-100"
          >
            <ChevronLeft size={18} className="mr-1" />
            목록으로
          </Link>
          <button onClick={handleApplyCourse} className="px-8 py-2 rounded-md bg-black text-white hover:bg-gray-800">
            이 코스로 계획 세우기
          </button>
        </div>
      </div>

      {/* 오른쪽 패널 - 지도 */}
      <div className="w-1/3">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-black text-white">
            <h2 className="text-lg font-medium">여행 경로</h2>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-600 rounded-md hover:bg-gray-800">
                <Download size={18} />
              </button>
              <button className="p-2 border border-gray-600 rounded-md hover:bg-gray-800">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* 지도 영역 */}
          <div className="flex-1 bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl text-gray-400 font-bold mb-2">지도</div>
                <div className="text-sm text-gray-500">여행 경로를 지도에서 확인하세요</div>
              </div>
            </div>

            {/* 일정 요약 */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-md">
              <h3 className="font-bold mb-2">코스 요약</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>총 여행 기간:</span>
                  <span className="font-medium">
                    {course.days}일 ({course.nights}박)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>방문 장소:</span>
                  <span className="font-medium">
                    {course.itinerary.reduce((total, day) => total + day.places.length, 0)}곳
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>추천 교통수단:</span>
                  <span className="font-medium">렌트카</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>총 이동 거리:</span>
                  <span className="font-medium">약 120km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

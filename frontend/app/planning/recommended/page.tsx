"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Star } from "lucide-react"

export default function RecommendedCoursesPage() {
  const [activeTab, setActiveTab] = useState("all")

  const recommendedCourses = [
    {
      id: 1,
      title: "제주 동부 2박 3일 코스",
      description: "성산일출봉, 우도, 만장굴 등 제주 동부의 아름다운 명소들을 둘러보는 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 3,
      nights: 2,
      region: "east",
      rating: 4.8,
      reviewCount: 256,
      highlights: ["성산일출봉", "우도", "만장굴", "함덕해수욕장"],
      tags: ["자연", "바다", "유네스코"],
    },
    {
      id: 2,
      title: "제주 서부 2박 3일 코스",
      description: "협재해변, 한림공원, 카페거리 등 제주 서부의 인기 명소를 방문하는 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 3,
      nights: 2,
      region: "west",
      rating: 4.7,
      reviewCount: 189,
      highlights: ["협재해변", "한림공원", "애월 카페거리", "오설록 티 뮤지엄"],
      tags: ["해변", "카페", "휴식"],
    },
    {
      id: 3,
      title: "제주 남부 2박 3일 코스",
      description: "중문관광단지, 천지연폭포 등 제주 남부의 명소를 둘러보는 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 3,
      nights: 2,
      region: "south",
      rating: 4.6,
      reviewCount: 142,
      highlights: ["중문관광단지", "천지연폭포", "서귀포 올레시장", "주상절리"],
      tags: ["폭포", "해변", "쇼핑"],
    },
    {
      id: 4,
      title: "제주 일주 3박 4일 코스",
      description: "제주도 전체를 한 바퀴 돌며 주요 명소를 모두 방문하는 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 4,
      nights: 3,
      region: "all",
      rating: 4.9,
      reviewCount: 312,
      highlights: ["성산일출봉", "한라산", "협재해변", "중문관광단지"],
      tags: ["종합", "일주", "완전정복"],
    },
    {
      id: 5,
      title: "제주 맛집 투어 2박 3일 코스",
      description: "제주의 유명 맛집들을 중심으로 구성된 식도락 여행 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 3,
      nights: 2,
      region: "food",
      rating: 4.7,
      reviewCount: 178,
      highlights: ["흑돼지 맛집", "해산물 맛집", "제주 카페", "향토 음식"],
      tags: ["맛집", "식도락", "카페"],
    },
    {
      id: 6,
      title: "제주 가족 여행 3박 4일 코스",
      description: "아이들과 함께 즐길 수 있는 테마파크와 체험 명소 중심의 가족 여행 코스",
      image: "/placeholder.svg?height=200&width=400",
      days: 4,
      nights: 3,
      region: "family",
      rating: 4.8,
      reviewCount: 203,
      highlights: ["아쿠아플라넷", "에코랜드", "미니랜드", "테디베어 뮤지엄"],
      tags: ["가족", "테마파크", "체험"],
    },
  ]

  const filteredCourses =
    activeTab === "all" ? recommendedCourses : recommendedCourses.filter((course) => course.region === activeTab)

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      {/* 탭 메뉴 */}
      <div className="border-b overflow-x-auto bg-black text-white">
        <div className="flex">
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "all" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("all")}
          >
            전체 코스
          </button>
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "east" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("east")}
          >
            동부 코스
          </button>
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "west" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("west")}
          >
            서부 코스
          </button>
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "south" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("south")}
          >
            남부 코스
          </button>
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "food" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("food")}
          >
            맛집 코스
          </button>
          <button
            className={`px-6 py-4 whitespace-nowrap ${
              activeTab === "family" ? "border-b-2 border-white font-medium" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("family")}
          >
            가족 코스
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-black">추천 여행 코스</h1>
        <p className="text-gray-700 mb-8">
          제주도 여행 전문가들이 추천하는 인기 여행 코스입니다. 원하는 코스를 선택하여 빠르게 여행 계획을 세워보세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg overflow-hidden bg-white hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-black text-white rounded-full px-3 py-1 text-sm font-medium">
                  {course.nights}박 {course.days}일
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold mb-2 text-black">{course.title}</h2>
                <div className="flex items-center mb-3">
                  <Star className="text-yellow-500" size={16} />
                  <span className="ml-1 font-medium">{course.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({course.reviewCount})</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 text-black">주요 방문지</h3>
                  <div className="flex flex-wrap gap-1">
                    {course.highlights.map((highlight, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="bg-black text-white text-xs px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/planning/recommended/${course.id}`}
                    className="flex items-center text-black hover:text-gray-700"
                  >
                    <span className="text-sm font-medium">자세히</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

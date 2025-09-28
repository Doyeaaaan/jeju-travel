"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Check, MapPin, Star } from "lucide-react"
import { destinations } from "@/data/destinations"
import { accommodations } from "@/data/accommodations"
import { restaurants } from "@/data/restaurants"

export default function PlanningStep2Page() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlaces, setSelectedPlaces] = useState<number[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("제주시")
  const [activeSubTab, setActiveSubTab] = useState("지역/읍면")
  const [activeCategory, setActiveCategory] = useState("숙소 유형")
  const [tripStartDate, setTripStartDate] = useState("")
  const [tripEndDate, setTripEndDate] = useState("")
  const [itemType, setItemType] = useState<"destinations" | "accommodations" | "restaurants">("accommodations")

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const storedStartDate = localStorage.getItem("tripStartDate")
    const storedEndDate = localStorage.getItem("tripEndDate")
    const storedPlaces = localStorage.getItem("selectedPlaces")

    if (storedStartDate) setTripStartDate(storedStartDate)
    if (storedEndDate) setTripEndDate(storedEndDate)
    if (storedPlaces) setSelectedPlaces(JSON.parse(storedPlaces))

    // 초기 데이터 설정
    setFilteredItems(accommodations)
  }, [])

  useEffect(() => {
    let items: any[] = []

    // 현재 선택된 탭에 따라 데이터 필터링
    if (activeSubTab === "지역/읍면") {
      items = accommodations
      setItemType("accommodations")
    } else if (activeSubTab === "문화/역사") {
      items = destinations.filter((dest) => dest.tags.includes("문화") || dest.tags.includes("역사"))
      setItemType("destinations")
    } else if (activeSubTab === "미식") {
      items = restaurants
      setItemType("restaurants")
    } else if (activeSubTab === "액티비티/아웃도어") {
      items = destinations.filter((dest) => dest.tags.includes("자연"))
      setItemType("destinations")
    } else if (activeSubTab === "도시탐험/쇼핑") {
      items = destinations.filter((dest) => dest.tags.includes("쇼핑"))
      setItemType("destinations")
    }

    // 검색어로 추가 필터링
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // 지역 필터링 (실제로는 더 정교한 필터링 로직이 필요)
    if (activeTab !== "전체") {
      // 여기서는 간단한 예시로 구현
      if (activeTab === "제주시") {
        items = items.filter((item) => item.address?.includes("제주시") || item.location?.includes("제주시"))
      } else if (activeTab === "제주시 서부") {
        items = items.filter(
          (item) =>
            item.address?.includes("제주시") &&
            (item.address?.includes("애월") ||
              item.address?.includes("한림") ||
              item.location?.includes("애월") ||
              item.location?.includes("한림")),
        )
      } else if (activeTab === "제주시 동부") {
        items = items.filter(
          (item) =>
            item.address?.includes("제주시") &&
            (item.address?.includes("구좌") ||
              item.address?.includes("조천") ||
              item.location?.includes("구좌") ||
              item.location?.includes("조천")),
        )
      } else if (activeTab === "서귀포시") {
        items = items.filter((item) => item.address?.includes("서귀포시") || item.location?.includes("서귀포시"))
      } else if (activeTab === "서귀포시 서부") {
        items = items.filter(
          (item) =>
            item.address?.includes("서귀포시") &&
            (item.address?.includes("안덕") ||
              item.address?.includes("대정") ||
              item.location?.includes("안덕") ||
              item.location?.includes("대정")),
        )
      } else if (activeTab === "서귀포시 동부") {
        items = items.filter(
          (item) =>
            item.address?.includes("서귀포시") &&
            (item.address?.includes("성산") ||
              item.address?.includes("표선") ||
              item.location?.includes("성산") ||
              item.location?.includes("표선")),
        )
      }
    }

    setFilteredItems(items)
  }, [searchQuery, activeTab, activeSubTab])

  const togglePlace = (id: number) => {
    if (selectedPlaces.includes(id)) {
      setSelectedPlaces(selectedPlaces.filter((placeId) => placeId !== id))
    } else {
      setSelectedPlaces([...selectedPlaces, id])
    }
  }

  const handleNext = () => {
    if (selectedPlaces.length > 0) {
      localStorage.setItem("selectedPlaces", JSON.stringify(selectedPlaces))
      router.push("/planning/schedule/step3")
    }
  }

  const formatPrice = (price: string) => {
    if (!price) return ""
    // 가격에서 숫자만 추출
    const numericPrice = price.replace(/[^0-9]/g, "")
    if (!numericPrice) return price

    // 숫자를 천 단위로 콤마 추가
    return Number.parseInt(numericPrice).toLocaleString() + "원"
  }

  const mainTabs = [
    { id: "제주시", label: "제주시" },
    { id: "제주시 서부", label: "제주시 서부" },
    { id: "제주시 동부", label: "제주시 동부" },
    { id: "서귀포시", label: "서귀포시" },
    { id: "서귀포시 서부", label: "서귀포시 서부" },
    { id: "서귀포시 동부", label: "서귀포시 동부" },
  ]

  const subTabs = [
    { id: "지역/읍면", label: "지역/읍면" },
    { id: "문화/역사", label: "문화/역사" },
    { id: "미식", label: "미식" },
    { id: "액티비티/아웃도어", label: "액티비티/아웃도어" },
    { id: "도시탐험/쇼핑", label: "도시탐험/쇼핑" },
  ]

  const filterCategories = [
    { id: "숙소 유형", label: "숙소 유형" },
    { id: "가격 범위", label: "가격 범위" },
    { id: "편의시설", label: "편의시설" },
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
            placeholder="원하는 숙소를 검색해보세요"
            className="w-full p-2 pl-10 pr-4 border rounded-full bg-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <div className="ml-auto">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* 메인 탭 메뉴 */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-6 whitespace-nowrap ${
                activeTab === tab.id ? "border-b-2 border-black font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 서브 탭 메뉴 */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-6 whitespace-nowrap ${
                activeSubTab === tab.id ? "border-b-2 border-black font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 옵션 */}
      <div className="border-b p-2">
        <div className="flex overflow-x-auto gap-2">
          {filterCategories.map((category) => (
            <button
              key={category.id}
              className={`py-1 px-4 text-sm rounded-full whitespace-nowrap ${
                activeCategory === category.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label} ▾
            </button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex">
        {/* 왼쪽 패널 - 장소 목록 */}
        <div className="w-1/2 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
          <div className="p-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="mb-4 border rounded-md overflow-hidden cursor-pointer hover:shadow-md"
                onClick={() => togglePlace(item.id)}
              >
                <div className="flex">
                  <div className="w-1/3 relative">
                    <div className="h-24 relative">
                      <Image
                        src={item.image || "/placeholder.svg?height=96&width=96"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {selectedPlaces.includes(item.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-2/3 p-3">
                    <div className="flex items-center">
                      <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded mr-1">
                        {itemType === "accommodations" ? "숙소" : itemType === "restaurants" ? "식당" : "명소"}
                      </div>
                      <h3 className="text-sm font-bold">{item.name}</h3>
                    </div>

                    <div className="flex items-center mt-1 text-xs">
                      <div className="flex text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                      </div>
                      <span className="text-gray-500 ml-1">({item.reviewCount || 0})</span>
                    </div>

                    {item.address && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin size={10} className="mr-1" />
                        <span>{item.address}</span>
                      </div>
                    )}

                    {itemType === "accommodations" && item.price && (
                      <div className="mt-1 text-right">
                        <span className="text-xs text-gray-500">1박</span>
                        <span className="text-sm font-bold ml-1">{formatPrice(item.price)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 패널 - 지도 */}
        <div className="w-1/2 relative">
          <div className="h-[calc(100vh-200px)] bg-gray-200 flex items-center justify-center">
            <div className="text-center text-3xl text-gray-400 font-bold">지도</div>
          </div>

          {/* 선택된 장소 수 표시 */}
          <div className="absolute top-4 left-4 bg-white rounded-full px-4 py-2 shadow-md">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                {selectedPlaces.length}
              </div>
              <span>0시간 0분 / 24시간 0분</span>
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleNext}
              disabled={selectedPlaces.length === 0}
              className={`px-6 py-3 rounded-md ${
                selectedPlaces.length > 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

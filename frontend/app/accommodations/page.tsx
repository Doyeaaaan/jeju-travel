"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Wifi, Car, Coffee, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { accommodationService } from "../../lib/accommodation-service"
import KakaoMap, { type MarkerData } from "@/components/kakao-map"
import FavoriteButton from "@/components/FavoriteButton"

// API 응답에 맞는 타입 정의
interface AccommodationData {
  id: string  // 실제로는 'CNTS_000000000021452' 형태의 문자열
  name: string
  grade?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  address?: string
}

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<AccommodationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredAccommodation, setHoveredAccommodation] = useState<AccommodationData | null>(null)
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20) // 한 페이지당 20개씩 표시

  const categories = ["전체", "호텔", "펜션", "게스트하우스", "리조트", "민박"]
  const regions = ["전체", "제주시", "서귀포시", "애월", "한림", "성산", "우도", "조천", "구좌", "대정", "남원", "안덕", "표선"]

  // API에서 데이터 로드 (필터링 없이)
  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        setLoading(true)
        setError(null)


        // 제주 지역에서 100개 숙소만 로드
        const data = await accommodationService.searchPlaces("제주", "2025-08-28", "2025-08-29", 2, 100)

        
        // 첫 번째 숙소의 데이터 구조 확인
        if (data.length > 0) {
          
          // 가능한 ID 필드들 확인
          const possibleIdFields = ['id', 'placeId', 'contentsId', 'hotelId', 'accommodationId']
          possibleIdFields.forEach(field => {
            if (data[0][field] !== undefined) {
            }
          })
        }

        // id가 있는 숙소만 필터링
        const validAccommodations = data.filter(accommodation => accommodation.id != null)

        // 클라이언트 사이드에서도 추가 랜덤 배열 적용
        setAccommodations(validAccommodations)
      } catch (error) {
        setError("숙소 데이터를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadAccommodations()
  }, [])

  // 필터링된 숙소 목록
  const filteredAccommodations = accommodations.filter((accommodation) => {
    // 카테고리 필터링 로직 개선
    if (selectedCategory !== "전체") {
      const name = (accommodation.name || "").toLowerCase()
      const grade = (accommodation.grade || "").toLowerCase()
      const searchText = `${name} ${grade}`
      
      if (selectedCategory === "호텔") {
        return searchText.includes("호텔") || searchText.includes("hotel")
      } else if (selectedCategory === "펜션") {
        return searchText.includes("펜션") || searchText.includes("pension")
      } else if (selectedCategory === "게스트하우스") {
        return searchText.includes("게스트") || searchText.includes("guest") || searchText.includes("하우스")
      } else if (selectedCategory === "리조트") {
        return searchText.includes("리조트") || searchText.includes("resort")
      } else if (selectedCategory === "민박") {
        return searchText.includes("민박") || searchText.includes("민속")
      }
    }
    
    // 지역 필터 (개선된 로직)
    if (selectedRegion !== "전체") {
      const address = (accommodation.address || "").toLowerCase()
      const name = (accommodation.name || "").toLowerCase()
      const searchText = `${address} ${name}`
      
      // 지역별 키워드 매핑
      const regionKeywords = {
        "제주시": ["제주시", "제주특별자치도 제주시"],
        "서귀포시": ["서귀포시", "서귀포", "제주특별자치도 서귀포시"],
        "애월": ["애월", "애월읍", "애월리"],
        "한림": ["한림", "한림읍", "한림리"],
        "성산": ["성산", "성산읍", "성산리"],
        "우도": ["우도", "우도면", "우도리"],
        "조천": ["조천", "조천읍", "조천리"],
        "구좌": ["구좌", "구좌읍", "구좌리"],
        "대정": ["대정", "대정읍", "대정리"],
        "남원": ["남원", "남원읍", "남원리"],
        "안덕": ["안덕", "안덕면", "안덕리"],
        "표선": ["표선", "표선면", "표선리"]
      }
      
      const keywords = regionKeywords[selectedRegion] || [selectedRegion]
      const hasMatchingRegion = keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      )
      
      if (!hasMatchingRegion) {
        return false
      }
    }
    
    // 검색어 필터
    if (searchQuery && !accommodation.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    return true
  })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAccommodations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAccommodations = filteredAccommodations.slice(startIndex, endIndex)

  // 필터 변경 시 첫 페이지로 이동
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleAccommodationHover = (accommodation: AccommodationData) => {
    setHoveredAccommodation(accommodation)
  }

  const handleAccommodationLeave = () => {
    setHoveredAccommodation(null)
  }

  // 호버된 숙소 변경 시 마커 업데이트
  useEffect(() => {
    
    if (hoveredAccommodation && hoveredAccommodation.latitude && hoveredAccommodation.longitude) {
        name: hoveredAccommodation.name,
        lat: hoveredAccommodation.latitude,
        lng: hoveredAccommodation.longitude
      })
      
      const marker: MarkerData = {
        id: 'hovered-accommodation',
        position: {
          lat: hoveredAccommodation.latitude,
          lng: hoveredAccommodation.longitude,
        },
        title: hoveredAccommodation.name,
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px; color: #f97316;">🏨 ${hoveredAccommodation.name}</h3>
            <p style="margin: 0; color: #666;">${hoveredAccommodation.grade || ''}</p>
            <p style="margin: 5px 0 0 0; color: #666;">${hoveredAccommodation.address || ''}</p>
            <p style="margin: 5px 0 0 0; color: #f97316; font-style: italic;">마우스 오버 중</p>
          </div>
        `,
      }
      setMapMarkers([marker])
    } else {
      setMapMarkers([])
    }
  }, [hoveredAccommodation])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-lg">숙소 데이터를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/house.png" alt="제주도 숙소" width={32} height={32} className="w-8 h-8" />
          <div className="text-2xl font-bold">제주도 숙소</div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Search size={20} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="숙소명, 지역으로 검색" 
              className="ml-2 border-none outline-none w-64"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="py-4 border-b">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">카테고리:</span>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">지역:</span>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">검색:</span>
            <input
              type="text"
              placeholder="숙소명으로 검색"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 숙소 개수 표시 */}
      <div className="py-4">
        <div className="text-lg font-semibold text-gray-800">
          총 {filteredAccommodations.length}개의 숙소
          {accommodations.length > 0 && (
            <span className="text-sm text-gray-500 ml-2">(전체 {accommodations.length}개 중)</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {currentPage}페이지 / 총 {totalPages}페이지 ({currentAccommodations.length}개 표시 중)
        </div>
      </div>

      {/* 숙소 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredAccommodations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {accommodations.length === 0 ? "숙소 데이터가 없습니다." : "검색 조건에 맞는 숙소가 없습니다."}
              </div>
            </div>
          ) : (
            currentAccommodations.map((accommodation, index) => (
              <Link
                href={`/accommodations/${accommodation.id}`}
                key={accommodation.id}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border cursor-pointer"
                onMouseEnter={() => handleAccommodationHover(accommodation)}
                onMouseLeave={handleAccommodationLeave}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 relative">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={accommodation.imageUrl || "/placeholder.svg?height=300&width=400"}
                        alt={accommodation.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=300&width=400"
                        }}
                      />
                      {accommodation.grade && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-black">
                          {accommodation.grade}
                        </div>
                      )}
                      {/* 좋아요 버튼 */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          placeId={accommodation.id ? parseInt(String(accommodation.id).replace('CNTS_', '')) : 0}
                          type="ACCOMMODATION"
                          size="md"
                          className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md"
                        />
                        {/* 디버깅용 로그 */}
                      </div>
                    </div>
                  </div>
                  <div className="sm:w-2/3 p-5">
                    <h3 className="font-bold text-lg text-gray-900">{accommodation.name}</h3>

                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-gray-500">리뷰수 없음</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span>{accommodation.address || "위치 정보 없음"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-gray-100 text-xs px-3 py-1.5 rounded-full flex items-center">
                        <Wifi size={12} className="mr-1.5" />
                        무료 와이파이
                      </span>
                      <span className="bg-gray-100 text-xs px-3 py-1.5 rounded-full flex items-center">
                        <Car size={12} className="mr-1.5" />
                        주차장
                      </span>
                      <span className="bg-gray-100 text-xs px-3 py-1.5 rounded-full flex items-center">
                        <Coffee size={12} className="mr-1.5" />
                        레스토랑
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <div className="text-xs text-gray-500">1박 기준</div>
                      <div>
                        <span className="text-2xl font-bold text-gray-900">가격 문의</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              {/* 페이지 번호들 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
        </div>

        {/* 지도 영역 */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl overflow-hidden shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900">숙소 위치</h3>
              <p className="text-sm text-gray-500 mt-1">마우스를 올려서 위치를 확인하세요</p>
              <div className="text-xs text-gray-400 mt-2">총 {filteredAccommodations.length}개 숙소</div>
            </div>
            <div className="p-4">
              <KakaoMap
                width="100%"
                height="calc(100vh - 250px)"
                markers={mapMarkers}
                options={{
                  center: { lat: 33.3617, lng: 126.5292 }, // 제주도 중심
                  level: 8
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Clock, Search, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { attractionService, type Place } from "../../lib/attraction-service"
import KakaoMap, { type MarkerData } from "@/components/kakao-map"
import FavoriteButton from "@/components/FavoriteButton"

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredAttraction, setHoveredAttraction] = useState<Place | null>(null)
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20) // 한 페이지당 20개씩 표시

  const categories = ["전체", "관광지", "카페", "쇼핑", "액티비티"]
  const regions = ["전체", "제주시", "서귀포시", "애월", "한림", "성산", "우도"]

  // API에서 데이터 로드 - 여행 계획 페이지와 동일한 방식 사용
  useEffect(() => {
    const loadAttractions = async () => {
      try {
        setLoading(true)
        setError(null)


        // API에서 데이터 가져오기 - 여러 엔드포인트 시도
        let data = []
        let response, text
        
        // 첫 번째 시도: 기본 import 엔드포인트 (인증 없이, 랜덤 배열 적용)
        try {
          response = await fetch("/api/visitjeju/attractions?offset=0&limit=100&random=false", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          text = await response.text()
          
          // JSON 배열이나 객체로 시작하는지 확인
          const trimmedText = text.trim()
          if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
            data = JSON.parse(trimmedText)
          } else {
            // JSON이 아닌 경우, JSON 부분을 찾아서 파싱 시도
            const jsonStart = trimmedText.indexOf('[')
            const jsonEnd = trimmedText.lastIndexOf(']')
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const jsonPart = trimmedText.substring(jsonStart, jsonEnd + 1)
              data = JSON.parse(jsonPart)
            } else {
              throw new Error("No JSON array found in first endpoint")
            }
          }
        } catch (firstError) {
          
          // 두 번째 시도: attractions 전용 엔드포인트 (인증 없이, 랜덤 배열 적용)
          try {
            response = await fetch("/api/visitjeju/attractions?offset=0&limit=100&random=false", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }
            
            text = await response.text()
            
            const trimmedText = text.trim()
            if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
              data = JSON.parse(trimmedText)
            } else {
              const jsonStart = trimmedText.indexOf('[')
              const jsonEnd = trimmedText.lastIndexOf(']')
              
              if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const jsonPart = trimmedText.substring(jsonStart, jsonEnd + 1)
                data = JSON.parse(jsonPart)
              } else {
                throw new Error("No JSON array found in second endpoint")
              }
            }
          } catch (secondError) {
            throw new Error("All endpoints failed")
          }
        }
        
        // attractions 엔드포인트는 관광지 데이터이므로 category를 c1으로 설정
        const filteredAttractions = Array.isArray(data) ? data.filter((item: any) => 
          item && item.name
        ).map((item: any) => ({
          ...item,
          category: "c1" // attractions 엔드포인트는 관광지
        })) : []
        
        
        // 데이터 매핑
        const mappedAttractions = filteredAttractions.map((item: any) => ({
          id: item.id || item.contentsId || String(Math.random()),
          name: item.name || "이름 없음",
          address: item.address || "주소 정보 없음",
          imageUrl: item.imageUrl || "/placeholder.svg?height=300&width=400",
          category: "c1", // attractions 엔드포인트는 관광지
          description: item.description || "",
          introduction: item.introduction || "",
          tag: item.tag || "",
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          hours: item.hours || ""
        }))
        
        
        // 위치 정보가 있는 관광지 확인
        const attractionsWithLocation = mappedAttractions.filter(attraction => 
          attraction.latitude && attraction.longitude && 
          attraction.latitude !== 0 && attraction.longitude !== 0
        )
        if (attractionsWithLocation.length > 0) {
            name: attractionsWithLocation[0].name,
            lat: attractionsWithLocation[0].latitude,
            lng: attractionsWithLocation[0].longitude
          })
        }

        // 클라이언트 사이드에서도 추가 랜덤 배열 적용
        setAttractions(mappedAttractions)
      } catch (error) {
        setError("관광지 데이터를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadAttractions()
  }, [])

  // 필터링된 관광지 목록
  const filteredAttractions = attractions
    .filter((attraction) => {
      if (selectedCategory === "전체") return true
      return attractionService.filterByCategory([attraction], selectedCategory).length > 0
    })
    .filter((attraction) => {
      if (selectedRegion === "전체") return true
      return attractionService.filterByRegion([attraction], selectedRegion).length > 0
    })
    .filter((attraction) => {
      if (!searchQuery.trim()) return true
      return attractionService.searchAttractions([attraction], searchQuery).length > 0
    })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAttractions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAttractions = filteredAttractions.slice(startIndex, endIndex)

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

  const handleAttractionHover = (attraction: Place) => {
    setHoveredAttraction(attraction)
  }

  const handleAttractionLeave = () => {
    setHoveredAttraction(null)
  }

  // 호버된 관광지 변경 시 마커 업데이트
  useEffect(() => {
    
    if (hoveredAttraction && hoveredAttraction.latitude && hoveredAttraction.longitude) {
        name: hoveredAttraction.name,
        lat: hoveredAttraction.latitude,
        lng: hoveredAttraction.longitude
      })
      
      const marker: MarkerData = {
        id: 'hovered-attraction',
        position: {
          lat: hoveredAttraction.latitude,
          lng: hoveredAttraction.longitude,
        },
        title: hoveredAttraction.name,
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px; color: #10b981;">👆 ${hoveredAttraction.name}</h3>
            <p style="margin: 0; color: #666;">${hoveredAttraction.category || ''}</p>
            <p style="margin: 5px 0 0 0; color: #666;">${hoveredAttraction.address || ''}</p>
            <p style="margin: 5px 0 0 0; color: #10b981; font-style: italic;">마우스 오버 중</p>
          </div>
        `,
      }
      setMapMarkers([marker])
    } else {
      setMapMarkers([])
    }
  }, [hoveredAttraction])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-lg">관광지 데이터를 불러오는 중...</div>
          <div className="text-sm text-gray-500 mt-2">잠시만 기다려주세요...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/Dol_Hareubang.png" alt="제주도 관광지" width={32} height={32} className="w-8 h-8" />
          <div className="text-2xl font-bold">제주도 관광지</div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="관광지명, 지역으로 검색"
              className="ml-2 border-none outline-none w-64"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="py-4 border-b">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
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
        </div>
      </div>

      {/* 관광지 개수 표시 */}
      <div className="py-4">
        <div className="text-lg font-semibold text-gray-800">
          총 {filteredAttractions.length}개의 관광지
          {attractions.length > 0 && (
            <span className="text-sm text-gray-500 ml-2">(전체 {attractions.length}개 중)</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {currentPage}페이지 / 총 {totalPages}페이지 ({currentAttractions.length}개 표시 중)
        </div>
      </div>

      {/* 관광지 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredAttractions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {attractions.length === 0 ? "관광지 데이터가 없습니다." : "검색 조건에 맞는 관광지가 없습니다."}
              </div>
              {attractions.length === 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    다시 로드
                  </button>
                </div>
              )}
            </div>
          ) : (
            currentAttractions.map((attraction, index) => (
              <Link
                href={`/attractions/${attraction.id}`}
                key={attraction.id || index}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border cursor-pointer"
                onMouseEnter={() => handleAttractionHover(attraction)}
                onMouseLeave={handleAttractionLeave}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 relative">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={attraction.imageUrl || "/placeholder.svg?height=300&width=400"}
                        alt={attraction.name || "관광지 이미지"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=300&width=400"
                        }}
                      />
                      {attraction.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-black">
                          {attraction.category}
                        </div>
                      )}
                      {/* 좋아요 버튼 */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          placeId={Number(attraction.id)}
                          type="TOURIST"
                          size="md"
                          className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:w-2/3 p-5">
                    <h3 className="font-bold text-lg text-gray-900">{attraction.name || "관광지명 없음"}</h3>

                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-gray-500">리뷰수 없음</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span>{attraction.address || "주소 정보 없음"}</span>
                    </div>

                    {attraction.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{attraction.description}</p>
                    )}

                    {attraction.tag && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {attraction.tag
                          .split(",")
                          .slice(0, 3)
                          .map((tag, tagIndex) => (
                            <span key={tagIndex} className="bg-gray-100 text-xs px-3 py-1.5 rounded-full">
                              {tag.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-end">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        <span>운영시간 확인</span>
                      </div>
                      {attraction.latitude && attraction.longitude && (
                        <div className="text-xs text-blue-500">위치 정보 있음</div>
                      )}
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
              <h3 className="font-medium text-gray-900">관광지 위치</h3>
              <p className="text-sm text-gray-500 mt-1">마우스를 올려서 위치를 확인하세요</p>
              <div className="text-xs text-gray-400 mt-2">총 {filteredAttractions.length}개 관광지</div>
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

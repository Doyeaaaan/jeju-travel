import { apiClient } from "./api-client"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

export interface Place {
  contentsId: string
  name: string
  address?: string
  latitude: number
  longitude: number
  imageUrl?: string
  category?: string
  region?: string
  description?: string
  tag?: string
  // 상세보기용 추가 필드들
  introduction?: string
  phone?: string
  roadAddress?: string
  placeUrl?: string
  detailInfo?: string
  rating?: number
  reviewCount?: number
  kakaoPlaceId?: string
}

type CategoryType = "자연" | "문화" | "체험" | "음식"

export const attractionService = {
  async getAttractions(page = 3, size = 30) {
    log("🎯 AttractionService.getAttractions 호출됨:", { page, size })

    try {
      // 2초 대기 (Rate Limiting 방지)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 관광지와 맛집 데이터를 모두 가져옴
      const [attractionsResponse, restaurantsResponse] = await Promise.all([
        apiClient.get(`/visitjeju/attractions?offset=${(page - 1) * size}&limit=${size}`),
        apiClient.get(`/visitjeju/restaurants?offset=${(page - 1) * size}&limit=${size}`)
      ])

      log("✅ 데이터 가져오기 성공:", 
        "관광지:", Array.isArray(attractionsResponse) ? attractionsResponse.length : "Not an array",
        "맛집:", Array.isArray(restaurantsResponse) ? restaurantsResponse.length : "Not an array")

      // 응답에 category 추가
      const attractions = (Array.isArray(attractionsResponse) ? attractionsResponse : [])
        .map(item => ({ ...item, category: "c1" }))
      const restaurants = (Array.isArray(restaurantsResponse) ? restaurantsResponse : [])
        .map(item => ({ ...item, category: "c4" }))
      
      const allPlaces = [...attractions, ...restaurants]

      // 카테고리 분포 확인
      const categories = new Set(allPlaces.map(item => item.category).filter(Boolean))
      log("📊 카테고리 종류:", Array.from(categories))

      // 필터링 조건 완화 - 기본적인 필수 필드만 확인
      const filteredPlaces = allPlaces.filter((item: any): item is Place => {
        const isValid = (
          item &&
          item.name &&
          item.name.trim() !== "" &&
          typeof item.latitude === "number" &&
          typeof item.longitude === "number" &&
          item.latitude !== 0 &&
          item.longitude !== 0 &&
          item.category // category 필드 확인 추가
        )

        if (!isValid) {
          log("⚠️ 유효하지 않은 장소 데이터:", item)
        }

        return isValid
      })

      log("📋 필터링 전 장소:", allPlaces.length, "개")
      log("📋 필터링 후 장소:", filteredPlaces.length, "개")

      // 첫 5개 항목의 상세 정보 로그
      log("🔍 첫 5개 장소 상세 정보:")
      filteredPlaces.slice(0, 5).forEach((place, index) => {
        log(`${index + 1}. ${place.name}:`, {
          category: place.category,
          region: place.region,
          address: place.address,
          tag: place.tag
        })
      })

      return filteredPlaces
    } catch (error: unknown) {

      if (error instanceof Error && error.message.includes("API 접근이 제한")) {
        log("⚠️ API 접근 제한으로 인해 빈 데이터 반환")
        return []
      }

      throw error
    }
  },

  async getAllAttractions() {
    log("🌟 전체 관광지 데이터 수집 시작...")

    try {
      const allAttractions: Place[] = []

      // 3페이지만 요청 (총 90개 정도)
      for (let page = 1; page <= 3; page++) {
        log(`📄 페이지 ${page} 요청 중...`)

        try {
          const pageAttractions = await this.getAttractions(page, 30)
          allAttractions.push(...pageAttractions)

          log(`✅ 페이지 ${page} 완료: ${pageAttractions.length}개 추가`)

          // 페이지 간 대기 시간 (Rate Limiting 방지)
          if (page < 3) {
            await new Promise((resolve) => setTimeout(resolve, 3000))
          }
        } catch (error: unknown) {
          // 한 페이지 실패해도 계속 진행
          continue
        }
      }

      log("🎉 전체 관광지 수집 완료:", allAttractions.length, "개")
      return allAttractions
    } catch (error: unknown) {
      return []
    }
  },

  async searchAttractionsByCategory(category: CategoryType) {
    log("🔍 카테고리별 관광지 검색:", category)

    try {
      const allAttractions = await this.getAllAttractions()

      // 카테고리별 필터링 (간단한 키워드 매칭)
      const categoryKeywords = {
        자연: ["오름", "해변", "폭포", "산", "바다", "숲", "공원", "자연"],
        문화: ["박물관", "미술관", "전시", "문화", "역사", "유적", "사찰", "절"],
        체험: ["체험", "승마", "카누", "서핑", "골프", "캠핑", "글램핑", "ATV"],
        음식: ["맛집", "카페", "음식", "레스토랑", "횟집", "점빵"],
      }

      const keywords = categoryKeywords[category] || []
      if (keywords.length === 0) {
        return allAttractions
      }

      const filtered = allAttractions.filter((attraction) => {
        const name = attraction.name || ""
        const address = attraction.address || ""
        const searchText = `${name} ${address}`.toLowerCase()

        return keywords.some((keyword: string) => searchText.includes(keyword))
      })

      log(`📋 ${category} 카테고리 관광지:`, filtered.length, "개")
      return filtered
    } catch (error: unknown) {
      return []
    }
  },

  // 카테고리별 필터링
  filterByCategory(attractions: Place[], category: string): Place[] {
    if (category === "전체") return attractions

    // 백엔드 카테고리(c1, c4)와 프론트엔드 카테고리 매핑
    const categoryMap: { [key: string]: string[] } = {
      "관광지": ["c1"],
      "맛집": ["c4"],
      "카페": ["c4"],  // 맛집 카테고리에 포함
      "쇼핑": ["c1"],  // 관광지 카테고리에 포함
      "액티비티": ["c1"]  // 관광지 카테고리에 포함
    }

    const backendCategories = categoryMap[category] || []
    if (backendCategories.length === 0) return attractions

    return attractions.filter(attraction => {
      // 카테고리 매칭
      const hasMatchingCategory = backendCategories.includes(attraction.category || "")
      
      // 태그 기반 서브카테고리 매칭
      const tags = (attraction.tag || "").toLowerCase()
      const name = (attraction.name || "").toLowerCase()
      const desc = (attraction.description || "").toLowerCase()
      const searchText = `${name} ${desc} ${tags}`

      let isSubcategoryMatch = false
      if (category === "카페" && hasMatchingCategory) {
        isSubcategoryMatch = searchText.includes("카페") || searchText.includes("커피")
      } else if (category === "쇼핑" && hasMatchingCategory) {
        isSubcategoryMatch = searchText.includes("쇼핑") || searchText.includes("마트") || searchText.includes("아울렛")
      } else if (category === "액티비티" && hasMatchingCategory) {
        isSubcategoryMatch = searchText.includes("체험") || searchText.includes("액티비티") || searchText.includes("레저")
      } else {
        isSubcategoryMatch = true
      }

      log(`🔍 카테고리 필터링 - ${attraction.name}:`, {
        category: attraction.category,
        tags: tags,
        searchText: searchText.slice(0, 50) + "...",
        hasMatchingCategory,
        isSubcategoryMatch
      })
      
      return hasMatchingCategory && isSubcategoryMatch
    })
  },

  // 지역별 필터링
  filterByRegion(attractions: Place[], region: string): Place[] {
    if (region === "전체") return attractions

    const regionMap: { [key: string]: string[] } = {
      "제주시": ["제주시", "조천읍", "애월읍", "한림읍", "구좌읍", "우도면"],
      "서귀포시": ["서귀포시", "남원읍", "성산읍", "안덕면", "대정읍"],
      "애월": ["애월", "애월읍"],
      "한림": ["한림", "한림읍"],
      "성산": ["성산", "성산읍"],
      "우도": ["우도", "우도면"]
    }

    const keywords = regionMap[region] || [region]
    return attractions.filter(attraction => {
      const address = (attraction.address || "").toLowerCase()
      return keywords.some(keyword => address.includes(keyword.toLowerCase()))
    })
  },

  // 검색어로 필터링
  searchAttractions(attractions: Place[], query: string): Place[] {
    if (!query.trim()) return attractions

    const searchTerms = query.toLowerCase().split(" ")
    return attractions.filter(attraction => {
      const searchText = `${attraction.name} ${attraction.address || ""} ${attraction.description || ""} ${attraction.category || ""}`.toLowerCase()
      return searchTerms.every(term => searchText.includes(term))
    })
  },

  // 관광지 상세 정보 가져오기
  async getAttractionDetail(contentsId: string): Promise<Place | null> {
    try {
      log("🎯 관광지 상세 정보 요청:", contentsId)
      const response = await apiClient.get<Place>(`/visitjeju/attractions/${contentsId}`)
      log("✅ 관광지 상세 정보 응답:", response)
      return response
    } catch (error) {
      return null
    }
  }
}

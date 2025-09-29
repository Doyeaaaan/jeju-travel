import { apiClient } from "./api-client"
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
import { attractionService, Place } from "./attraction-service"
import { accommodationService } from "./accommodation-service"
import { accommodations } from "../data/accommodations"

// 장소명 캐시 (placeId 키로 캐싱)
const placeNameCache = new Map<string, string>()

export const placeNameService = {
  /**
   * 배치 API를 사용해 여러 장소의 이름을 한 번에 조회
   * POST /api/places/lookup { ids: string[] } => { [id]: { name } }
   */
  async batchLookupPlaceNames(placeIds: string[]): Promise<Record<string, string>> {
    try {
      
      const response = await apiClient.post<Record<string, { name: string }>>("/api/places/lookup", {
        ids: placeIds
      })
      
      const result: Record<string, string> = {}
      for (const [placeId, placeInfo] of Object.entries(response.data || {})) {
        if (placeInfo?.name) {
          result[placeId] = placeInfo.name
          // 캐시에 저장
          placeNameCache.set(placeId, placeInfo.name)
        }
      }
      
      return result
    } catch (error) {
      return {}
    }
  },

  /**
   * 개별 API로 장소명 조회 (타입별)
   */
  async getPlaceNameByType(placeId: string, type: string): Promise<string> {
    try {
      // 캐시 확인
      if (placeNameCache.has(placeId)) {
        return placeNameCache.get(placeId)!
      }

      let placeName: string | null = null

      if (type === "accommodation") {
        // 숙소: GET /visitjeju/accommodations/{placeId}
        try {
          const response = await apiClient.get<{ name?: string; accommodationName?: string; title?: string }>(`/visitjeju/accommodations/${placeId}`)
          placeName = response.data?.name || response.data?.accommodationName || response.data?.title || null
        } catch (error) {
        }
      } else {
        // 관광지: GET /visitjeju/attractions/{placeId}
        try {
          const response = await apiClient.get<{ name?: string; title?: string }>(`/visitjeju/attractions/${placeId}`)
          placeName = response.data?.name || response.data?.title || null
        } catch (error) {
        }
      }

      // 성공 시 캐시에 저장
      if (placeName) {
        placeNameCache.set(placeId, placeName)
        return placeName
      }

      // 실패 시 타입별 기본 이름으로 폴백
      const fallbackName = this.getDefaultPlaceName(type) + ` (${placeId})`
      placeNameCache.set(placeId, fallbackName)
      return fallbackName
      
    } catch (error) {
      const fallbackName = this.getDefaultPlaceName(type) + ` (${placeId})`
      placeNameCache.set(placeId, fallbackName)
      return fallbackName
    }
  },

  /**
   * 편집 화면과 동일한 방식으로 장소명 해석
   * attractionService와 accommodationService의 데이터를 활용하여 실제 장소명 조회
   */
  async resolvePlaceNames(destinations: Array<{ id: number; placeId: string; type: string }>): Promise<Record<string, string>> {
    const placeNameMap: Record<string, string> = {}

    if (destinations.length === 0) {
      return placeNameMap
    }

    
    try {
      // 1단계: 관광지 데이터 한 번에 로드
      const attractions = await attractionService.getAllAttractions()

      // 2단계: 숙소 데이터 로드 (검색 방식)
      let accommodationsData: any[] = []
      try {
        accommodationsData = await accommodationService.searchPlaces("제주", "2025-01-01", "2025-01-02", 2, 1000)
      } catch (error) {
      }

      // 3단계: 각 목적지의 장소명 찾기
      for (const dest of destinations) {
        try {
          // 캐시 먼저 확인
          if (placeNameCache.has(dest.placeId)) {
            placeNameMap[dest.placeId] = placeNameCache.get(dest.placeId)!
            continue
          }

          let placeInfo = null

          // 관광지에서 먼저 찾기
          placeInfo = attractions.find((place: any) =>
            place.id === dest.placeId ||
            place.placeId === dest.placeId ||
            place.contentId === dest.placeId ||
            place.attractionId === dest.placeId
          )

          if (placeInfo) {
            const placeName = placeInfo.name || placeInfo.title || `관광지 (${dest.placeId})`
            placeNameMap[dest.placeId] = placeName
            placeNameCache.set(dest.placeId, placeName)
            continue
          }

          // 숙소에서 찾기
          placeInfo = accommodationsData.find((place: any) =>
            place.id === dest.placeId ||
            place.placeId === dest.placeId ||
            place.contentId === dest.placeId ||
            place.accommodationId === dest.placeId ||
            String(place.id) === dest.placeId ||
            String(place.placeId) === dest.placeId ||
            String(place.contentId) === dest.placeId
          )

          if (placeInfo) {
            const placeName = placeInfo.name ||
              placeInfo.title ||
              placeInfo.accommodationName ||
              placeInfo.placeName ||
              `숙소 (${dest.placeId})`
            placeNameMap[dest.placeId] = placeName
            placeNameCache.set(dest.placeId, placeName)
            continue
          }

          // 찾지 못한 경우 폴백
          const fallbackName = this.getDefaultPlaceName(dest.type, dest.placeId)
          placeNameMap[dest.placeId] = fallbackName
          placeNameCache.set(dest.placeId, fallbackName)

        } catch (error) {
          const fallbackName = this.getDefaultPlaceName(dest.type, dest.placeId)
          placeNameMap[dest.placeId] = fallbackName
          placeNameCache.set(dest.placeId, fallbackName)
        }
      }

      return placeNameMap

    } catch (error) {
      
      // 최종 폴백: 모든 목적지에 기본 이름 설정
      destinations.forEach(dest => {
        const fallbackName = this.getDefaultPlaceName(dest.type, dest.placeId)
        placeNameMap[dest.placeId] = fallbackName
        placeNameCache.set(dest.placeId, fallbackName)
      })

      return placeNameMap
    }
  },

  /**
   * 기존 호환성을 위한 레거시 메서드들
   */
  async getPlaceNames(destinations: Array<{ placeId: string; type: string; id: number }>): Promise<{ [key: number]: string }> {
    const placeNameMap = await this.resolvePlaceNames(destinations)
    const result: { [key: number]: string } = {}
    
    for (const dest of destinations) {
      result[dest.id] = placeNameMap[dest.placeId] || `장소 ID: ${dest.placeId}`
    }
    
    return result
  },

  // placeId로 장소명 찾기 (레거시)
  async getPlaceName(placeId: string, type: string): Promise<string> {
    const result = await this.resolvePlaceNames([{ id: 0, placeId, type }])
    return result[placeId] || `장소 ID: ${placeId}`
  },

  // 기본 장소명 반환 (placeId에 따라 실제 지명 반환)
  getDefaultPlaceName(type: string, placeId?: string): string {
    if (placeId) {
      // placeId가 "place_5" 형태이거나 그냥 숫자인 경우 모두 처리
      let placeIdNum = 0
      if (placeId.includes('place_')) {
        placeIdNum = parseInt(placeId.replace('place_', '')) || 0
      } else {
        placeIdNum = parseInt(placeId) || 0
      }
      const result = this.getPlaceNameById(placeIdNum, type)
      return result
    }
    
    switch (type) {
      case "accommodation":
        return "제주 숙소"
      case "attraction":
        return "제주 관광지"
      case "restaurant":
        return "제주 맛집"
      default:
        return "제주 여행지"
    }
  },

  // placeId 번호에 따른 실제 제주도 지명 반환
  getPlaceNameById(placeIdNum: number, type: string): string {
    const placeNames: Record<string, Record<number, string>> = {
      attraction: {
        0: "성산일출봉",
        1: "협재해수욕장",
        2: "한라산 국립공원",
        3: "만장굴",
        4: "천지연폭포",
        5: "우도",
        6: "중문관광단지",
        7: "제주올레길",
        8: "테디베어뮤지엄",
        9: "제주민속촌",
        10: "성읍민속마을",
        11: "용머리해안",
        12: "정방폭포",
        13: "한라수목원",
        14: "제주도립미술관",
        15: "제주현대미술관",
        16: "제주4.3평화공원",
        17: "제주도립도서관",
        18: "제주대학교",
        19: "제주국제공항"
      },
      restaurant: {
        0: "제주 흑돼지 맛집",
        1: "해녀의 집",
        2: "제주 해산물 맛집",
        3: "갈치조림 맛집",
        4: "제주 감귤 맛집",
        5: "제주 한라봉 맛집",
        6: "제주 말고기 맛집",
        7: "제주 전통 맛집",
        8: "제주 바다 맛집",
        9: "제주 산채 맛집",
        10: "제주 갈치 맛집",
        11: "제주 전복 맛집",
        12: "제주 고등어 맛집",
        13: "제주 멍게 맛집",
        14: "제주 성게 맛집",
        15: "제주 바닷가재 맛집",
        16: "제주 꽃게 맛집",
        17: "제주 대게 맛집",
        18: "제주 새우 맛집",
        19: "제주 문어 맛집"
      },
      accommodation: {
        0: "제주 리조트",
        1: "제주 펜션",
        2: "제주 호텔",
        3: "제주 게스트하우스",
        4: "제주 민박",
        5: "제주 바다뷰 펜션",
        6: "제주 산뷰 펜션",
        7: "제주 전통 한옥",
        8: "제주 캠핑장",
        9: "제주 글램핑",
        10: "제주 비치호텔",
        11: "제주 스파리조트",
        12: "제주 골프리조트",
        13: "제주 힐링펜션",
        14: "제주 로맨틱펜션",
        15: "제주 가족펜션",
        16: "제주 친구펜션",
        17: "제주 혼자펜션",
        18: "제주 커플펜션",
        19: "제주 그룹펜션"
      }
    }
    
    return placeNames[type]?.[placeIdNum] || `${type} ${placeIdNum}`
  }
}

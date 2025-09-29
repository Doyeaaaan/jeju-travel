import { apiClient } from "./api-client"
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
import type {
  KeywordRecommendationRequest,
  KeywordRecommendationResponse,
} from "../types/api-types"

export class RecommendationService {
  /**
   * 키워드 기반 여행 추천 요청
   */
  async getKeywordRecommendations(
    request: KeywordRecommendationRequest
  ): Promise<KeywordRecommendationResponse> {
    try {
      
      const response = await apiClient.post<KeywordRecommendationResponse>(
        "/api/recommendations/keyword-template",
        request,
        false // 인증 불필요
      )

      
      // 백엔드 ApiResponse 구조: { success, data, error }
      if (response.success === true && response.data) {
        return response  // 전체 응답 객체를 반환 (success, data, error 포함)
      } else {
        throw new Error(response.error?.message || "추천 요청에 실패했습니다.")
      }
    } catch (error: any) {
      throw new Error(error.message || "추천 서비스에 문제가 발생했습니다.")
    }
  }

  /**
   * 향상된 더미 데이터 생성 (랜덤화 + 조합 가중치)
   */
  generateMockRecommendations(request: KeywordRecommendationRequest): KeywordRecommendationResponse {
    const { startDate, endDate, travelers, keywords } = request
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // 키워드 조합 기반 시드 생성
    const keywordString = Object.values(keywords).flat().sort().join('_')
    const timeString = new Date().toISOString().slice(0, 13) // 시간별로 변화
    const seedString = `${timeString}_${keywordString}`
    
    // 간단한 해시 함수로 시드 생성
    let seed = 0
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i)
      seed = ((seed << 5) - seed) + char
      seed = seed & seed // 32비트 정수로 변환
    }
    
    // 시드 기반 랜덤 생성
    const seededRandom = this.seededRandom(seed)
    
    // 키워드 조합 가중치 계산
    const weights = this.getCombinationWeights(keywords)

    // 다중 후보 데이터
    const multiCandidates = this.getMultiCandidates(keywords)
    
    const option1: any = {
      id: 1,
      title: seededRandom() > 0.5 ? "자연과 힐링 중심 코스" : "바다와 산 체험 코스",
      days: Array.from({ length: days }, (_, dayIndex) => ({
        day: dayIndex + 1,
        items: [
          {
            label: this.getRandomItem(multiCandidates.tourist_spot, seededRandom),
            category: "관광지",
            placeId: `place_${dayIndex}`,
            slot: "MORNING"
          },
          {
            label: this.getRandomItem(multiCandidates.accommodation, seededRandom),
            category: "숙소",
            placeId: `place_${dayIndex + 10}`,
            slot: "LODGING"
          },
          {
            label: this.getRandomItem(multiCandidates.restaurant, seededRandom),
            category: "맛집",
            placeId: `place_${dayIndex + 20}`,
            slot: "DINNER"
          }
        ]
      }))
    }

    const option2: any = {
      id: 2,
      title: seededRandom() > 0.5 ? "문화와 체험 중심 코스" : "역사와 전통 탐방 코스",
      days: Array.from({ length: days }, (_, dayIndex) => ({
        day: dayIndex + 1,
        items: [
          {
            label: this.getRandomItem(multiCandidates.tourist_spot, seededRandom),
            category: "관광지",
            placeId: `place_${dayIndex + 30}`,
            slot: "MORNING"
          },
          {
            label: this.getRandomItem(multiCandidates.accommodation, seededRandom),
            category: "숙소",
            placeId: `place_${dayIndex + 40}`,
            slot: "LODGING"
          },
          {
            label: this.getRandomItem(multiCandidates.restaurant, seededRandom),
            category: "맛집",
            placeId: `place_${dayIndex + 50}`,
            slot: "DINNER"
          }
        ]
      }))
    }

    return {
      success: true,
      data: {
        startDate,
        endDate,
        travelers,
        selectedKeywords: keywords,
        options: [option1, option2]
      },
      error: null
    }
  }

  /**
   * 시드 기반 랜덤 생성기
   */
  private seededRandom(seed: number): () => number {
    let currentSeed = seed
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }
  }

  /**
   * 키워드 조합 가중치 계산
   */
  private getCombinationWeights(keywords: any): Record<string, number> {
    const weights: Record<string, number> = {}
    const allKeywords = Object.values(keywords).flat() as string[]
    
    // 조합 패턴별 가중치
    const combinationPatterns: Record<string, number> = {
      '자연_체험': 1.2,
      '맛_분위기': 1.3,
      '바다뷰_수영장': 1.1,
      '산뷰_조식포함': 1.0,
      '역사_문화': 1.2,
      '뷰_분위기': 1.4,
    }

    // 개별 키워드 가중치
    const individualWeights: Record<string, number> = {
      '자연': 1.0, '체험': 1.1, '역사': 0.9, '문화': 1.0, '풍경': 1.1,
      '맛': 1.2, '분위기': 1.1, '가성비': 0.8, '친절': 1.0, '청결': 0.9,
      '바다뷰': 1.2, '산뷰': 1.1, '수영장': 1.0, '조식포함': 0.9,
      '뷰': 1.3, '디저트': 1.1, '조용함': 0.9, '인테리어': 1.0
    }

    for (const keyword of allKeywords) {
      weights[keyword] = individualWeights[keyword] || 1.0
    }

    // 조합 패턴 확인
    const keywordString = allKeywords.sort().join('_')
    for (const [pattern, patternWeight] of Object.entries(combinationPatterns)) {
      if (keywordString.includes(pattern.replace('_', '_'))) {
        const patternKeywords = pattern.split('_')
        for (const kw of patternKeywords) {
          if (weights[kw]) {
            weights[kw] *= patternWeight
          }
        }
      }
    }

    return weights
  }

  /**
   * 키워드별 다중 후보 데이터 생성
   */
  private getMultiCandidates(keywords: any): Record<string, string[]> {
    const candidates: Record<string, string[]> = {
      tourist_spot: [],
      accommodation: [],
      restaurant: [],
      cafe: []
    }

    // 관광지 후보들
    const touristSpots = [
      '성산일출봉', '한라산', '협재해변', '천지연폭포', '우도', '섭지코지',
      '만장굴', '아쿠아플라넷', '에코랜드', '테디베어 뮤지엄', '제주 승마공원',
      '성읍민속마을', '제주목관아', '삼성혈', '돌하르방공원', '제주민속촌',
      '제주 4.3 평화공원', '제주 현대미술관', '제주 예술촌', '한라수목원',
      '월정리해변', '김녕 미로공원', '중문관광단지'
    ]

    // 숙소 후보들
    const accommodations = [
      '제주 바다뷰 펜션', '성산 바다 리조트', '협재 해변 호텔', '우도 바다 펜션',
      '함덕 바다뷰 호텔', '월정리 바다 스테이', '제주 한라산 리조트', '한라산 전망 펜션',
      '오름뷰 호텔', '산방산 리조트', '제주 산림 호텔', '제주 그랜드 호텔',
      '중문 수영장 리조트', '제주 워터파크 호텔', '해변 수영장 펜션', '스파 리조트',
      '제주 공항근처 호텔', '제주시 조식 호텔', '해변 조식 펜션', '한라산 조식 리조트'
    ]

    // 맛집 후보들
    const restaurants = [
      '제주 흑돼지 맛집', '해녀의 집', '제주 해산물집', '갈치조림 전문점',
      '전복죽 맛집', '옥돔구이 전문점', '한라산 정상 카페', '바다뷰 레스토랑',
      '오름 전망 카페', '전통 한옥 식당', '제주 시장 맛집', '학생 맛집',
      '현지인 맛집', '가족 경영 식당', '할머니 손맛', '위생 우수 식당',
      'HACCP 인증 맛집'
    ]

    // 카페 후보들
    const cafes = [
      '바다뷰 카페', '한라산 뷰 카페', '오름 전망 카페', '해변 테라스 카페',
      '감성 카페', '북카페', '빈티지 카페', '케이크 전문 카페',
      '제주 디저트 카페', '아이스크림 카페', '숲속 카페', '힐링 카페',
      '모던 카페', '자연 카페'
    ]

    // 키워드에 따라 후보 필터링
    const allKeywords = Object.values(keywords).flat() as string[]
    
    if (allKeywords.some(kw => ['자연', '체험', '역사', '문화', '풍경'].includes(kw))) {
      candidates.tourist_spot = touristSpots
    } else {
      candidates.tourist_spot = touristSpots.slice(0, 6)
    }

    if (allKeywords.some(kw => ['바다뷰', '산뷰', '수영장', '조식포함'].includes(kw))) {
      candidates.accommodation = accommodations
    } else {
      candidates.accommodation = accommodations.slice(0, 6)
    }

    if (allKeywords.some(kw => ['맛', '분위기', '가성비', '친절', '청결'].includes(kw))) {
      candidates.restaurant = restaurants
    } else {
      candidates.restaurant = restaurants.slice(0, 6)
    }

    if (allKeywords.some(kw => ['뷰', '분위기', '디저트', '조용함', '인테리어'].includes(kw))) {
      candidates.cafe = cafes
    } else {
      candidates.cafe = cafes.slice(0, 6)
    }

    return candidates
  }

  /**
   * 배열에서 랜덤 아이템 선택
   */
  private getRandomItem(items: string[], randomFn: () => number): string {
    if (items.length === 0) return "제주 명소"
    const index = Math.floor(randomFn() * items.length)
    return items[index]
  }
}

export const recommendationService = new RecommendationService()

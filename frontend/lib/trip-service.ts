import { apiClient } from "./api-client"
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
import { authService } from "./auth-service"
import type {
  TripPlanDto,
  TripDayDto,
  TripDayWithDestinationsDto,
  DestinationDto,
  CreateTripPlanRequest,
  AddTripDayRequest,
  CreateDestinationRequest,
  UpdateSequenceRequest,
  CostDto,
} from "@/types/api-types"

export class TripService {
  // 사용자의 모든 여행 계획 조회
  async getUserTripPlans(): Promise<{ data: TripPlanDto[] }> {
    log("📋 TripService.getUserTripPlans 호출됨")

    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error("로그인이 필요합니다.")
    }

    try {
      // GET /api/trip-plans/my-plans API 호출 (사용자별 여행 계획 목록)
      const response = await apiClient.get<any>("/api/trip-plans/my-plans")
      log("✅ 사용자 여행 계획 목록 조회 성공:", response)

      // 응답 데이터 구조 확인 및 정규화
      let tripPlans = []

      // 다양한 응답 구조에 대응
      if (response.data) {
        tripPlans = Array.isArray(response.data) ? response.data : [response.data]
      } else if (Array.isArray(response)) {
        tripPlans = response
      } else if (response.plans) {
        tripPlans = Array.isArray(response.plans) ? response.plans : [response.plans]
      } else if (response.content) {
        tripPlans = Array.isArray(response.content) ? response.content : [response.content]
      }

      log("📋 파싱된 여행 계획:", tripPlans.length, "개")

      // 데이터 정규화
      const normalizedPlans = tripPlans.map((plan: any) => ({
        id: plan.tripPlanId || plan.id || plan.planId,
        planName: plan.planName || plan.name || plan.title || "제목 없음",
        startDate: plan.startDate || plan.start_date,
        endDate: plan.endDate || plan.end_date,
        days: plan.days || plan.tripDays || [],
        createdAt: plan.createdAt || plan.created_at,
        updatedAt: plan.updatedAt || plan.updated_at,
      }))

      return {
        status: "success",
        message: "여행 계획 목록 조회 성공",
        data: normalizedPlans,
      }
    } catch (error: any) {

      // 404나 빈 응답인 경우 빈 배열 반환
      if (error.message?.includes("404") || error.message?.includes("Not Found") || error.status === 404) {
        log("⚠️ 여행 계획이 없거나 API 엔드포인트가 없습니다.")
        return {
          status: "success",
          message: "여행 계획이 없습니다.",
          data: [],
        }
      }

      // 인증 관련 에러는 다시 던지기
      if (error.message?.includes("인증") || error.status === 401 || error.status === 403) {
        throw error
      }

      // 기타 에러는 빈 배열 반환하고 로그만 남김
      return {
        status: "error",
        message: "여행 계획을 불러오는 중 오류가 발생했습니다.",
        data: [],
      }
    }
  }

  // 내 여행 계획 목록 조회 (서버 연동)
  async getPlans(): Promise<{ data: TripPlanDto[] }> {
    log("🔄 TripService.getPlans 호출됨")
    
    try {
      // 백엔드는 ApiResponse 래퍼 없이 직접 List<TripPlanDto>를 반환
      const response = await apiClient.get<any>("/api/trip-plans/my-plans")
      log("✅ 여행 계획 목록 조회 성공:", response)
      log("📦 response의 키들:", Object.keys(response))
      
      // response가 직접 배열이면 그대로 사용
      if (Array.isArray(response)) {
        log("🔧 response가 배열입니다:", response.length, "개")
        return { data: response }
      }
      
      // response.data가 있으면 사용
      if (response.data && Array.isArray(response.data)) {
        log("🔧 response.data가 배열입니다:", response.data.length, "개")
        return { data: response.data }
      }
      
      // 그 외의 경우 response 자체를 확인
      log("🔧 response 전체 구조:", response)
      return { data: [] }
    } catch (error) {
      throw error
    }
  }

  // 플랜 상세 조회 (일차별 일정 + 목적지 포함)
  async getPlanDays(planId: number): Promise<{ data: TripDayWithDestinationsDto[] }> {
    log("🔄 TripService.getPlanDays 호출됨:", { planId })
    
    try {
      // 백엔드는 ApiResponse<List<TripDayWithDestinationsDto>>를 반환
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days-with-dests`)
      log("✅ 플랜 상세 조회 성공:", response.data)
      
      // response.data.data가 실제 TripDayWithDestinationsDto[] 배열
      return { data: response.data.data || response.data }
    } catch (error) {
      throw error
    }
  }

  // 여행 계획 생성
  async createTripPlan(planName: string, startDate: string, endDate: string): Promise<{ data: TripPlanDto }> {
    log("🗓️ TripService.createTripPlan 호출됨:", { planName, startDate, endDate })

    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error("로그인이 필요합니다.")
    }

    const requestData: CreateTripPlanRequest = {
      planName,
      startDate,
      endDate,
    }

    try {
      const response = await apiClient.post<any>("/api/trip-plans", requestData)
      log("✅ 여행 계획 생성 성공:", response)

      // 응답 데이터 정규화
      const planData = response.data || response
      return {
        status: "success",
        message: "여행 계획 생성 성공",
        data: {
          id: planData.tripPlanId || planData.id || planData.planId,
          planName: planData.planName || planData.name,
          startDate: planData.startDate || planData.start_date,
          endDate: planData.endDate || planData.end_date,
          days: planData.days || planData.tripDays || [],
        },
      }
    } catch (error) {
      throw error
    }
  }

  // 여행 계획 조회
  async getTripPlan(planId: number): Promise<{ data: TripPlanDto }> {
    log("📋 TripService.getTripPlan 호출됨:", { planId })

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}`)
      log("✅ 여행 계획 원본 응답:", response)

      // API 응답 구조에 맞게 데이터 추출
      const tripPlanData = response.data || response
      log("✅ 여행 계획 데이터:", tripPlanData)

      // 응답 구조 통일
      return {
        status: "success",
        message: "여행 계획 조회 성공",
        data: {
          id: tripPlanData.tripPlanId || tripPlanData.id || tripPlanData.planId,
          planName: tripPlanData.planName || tripPlanData.name,
          startDate: tripPlanData.startDate || tripPlanData.start_date,
          endDate: tripPlanData.endDate || tripPlanData.end_date,
          days: tripPlanData.days || tripPlanData.tripDays || [],
        },
      }
    } catch (error) {
      throw error
    }
  }

  // 여행 일정과 목적지 함께 조회
  async getTripDaysWithDestinations(planId: number): Promise<{ data: TripDayWithDestinationsDto[] }> {
    log("📅 TripService.getTripDaysWithDestinations 호출됨:", { planId })

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days-with-dests`)
      log("✅ 일정과 목적지 원본 응답:", response)

      // API 응답이 배열인지 객체인지 확인
      let daysData = response.data || response
      if (daysData && !Array.isArray(daysData)) {
        // 응답이 객체 형태라면 days 배열 추출
        daysData = daysData.days || daysData.tripDays || []
      }

      log("✅ 일정과 목적지 조회 성공:", daysData?.length || 0, "일")
      log("📋 일정 데이터 구조:", daysData)

      return {
        status: "success",
        message: "일정과 목적지 조회 성공",
        data: daysData || [],
      }
    } catch (error) {
      throw error
    }
  }

  // 여행 일정 목록 조회
  async getTripDays(planId: number): Promise<{ data: TripDayDto[] }> {
    log("📅 TripService.getTripDays 호출됨:", { planId })

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days`)
      log("✅ 여행 일정 목록 조회 성공:", response.data?.length || 0, "일")

      // 응답 데이터 정규화
      const daysData = response.data || response
      return {
        status: "success",
        message: "여행 일정 목록 조회 성공",
        data: Array.isArray(daysData) ? daysData : [],
      }
    } catch (error) {
      throw error
    }
  }

  // 여행 일정 추가
  async addTripDay(planId: number, date: string): Promise<{ data: TripDayDto }> {
    log("📅 TripService.addTripDay 호출됨:", { planId, date })

    // LocalDate 형식으로 변환 (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0]
    log("📅 변환된 날짜:", formattedDate)

    const requestData: AddTripDayRequest = {
      date: formattedDate,
    }

    try {
      const response = await apiClient.post<any>(`/api/trip-plans/${planId}/days`, requestData)
      log("✅ 여행 일정 추가 성공:", response.data)

      // 응답 데이터 정규화
      const dayData = response.data || response
      return {
        status: "success",
        message: "여행 일정 추가 성공",
        data: {
          id: dayData.tripDayId || dayData.id,
          dayNumber: dayData.dayNumber,
          date: dayData.date,
        },
      }
    } catch (error) {
      throw error
    }
  }

  // 목적지 목록 조회
  async getDestinations(dayId: number): Promise<{ data: DestinationDto[] }> {
    log("📍 TripService.getDestinations 호출됨:", { dayId })

    try {
      const response = await apiClient.get<DestinationDto[]>(`/api/trip-days/${dayId}/destinations`)
      log("✅ 목적지 목록 조회 성공:", response.data?.length || 0, "개")
      return response
    } catch (error) {
      throw error
    }
  }

  // 목적지 추가 (기존 방식)
  async addDestination(
    dayId: number,
    placeId: string,
    type: string,
    sequence: number,
    duration: number,
    transportation?: string,
    price?: number,
  ): Promise<{ data: DestinationDto }> {
    log("📍 TripService.addDestination 호출됨:", {
      dayId,
      placeId,
      type,
      sequence,
      duration,
      transportation,
      price,
    })

    const requestData: CreateDestinationRequest = {
      tripDayId: dayId,
      sequence,
      transportation,
      duration,
      placeId,
      type,
      price,
    }

    try {
      const response = await apiClient.post<DestinationDto>(`/api/trip-days/${dayId}/destinations`, requestData)
      log("✅ 목적지 추가 성공:", response.data)
      return response
    } catch (error) {
      throw error
    }
  }

  // 목적지 추가 (백엔드 API 방식)
  async addDestinationToPlan(
    planId: number,
    dayId: number,
    placeId: string,
    placeName: string,
    address: string,
    category: string,
    memo?: string
  ): Promise<{ data: DestinationDto }> {
    log("📍 TripService.addDestinationToPlan 호출됨:", {
      planId,
      dayId,
      placeId,
      placeName,
      address,
      category,
      memo,
    })

    const requestData = {
      placeId,
      placeName,
      address,
      category,
      memo: memo || `${category} - AI 추천 장소`,
    }

    try {
      const response = await apiClient.post<DestinationDto>(`/api/trip-plans/${planId}/days/${dayId}/destinations`, requestData)
      log("✅ 목적지 추가 성공:", response.data)
      return response
    } catch (error) {
      throw error
    }
  }

  // 목적지 삭제
  async removeDestination(dayId: number, destId: number): Promise<void> {
    log("🗑️ TripService.removeDestination 호출됨:", { dayId, destId })

    try {
      await apiClient.delete(`/api/trip-days/${dayId}/destinations/${destId}`)
      log("✅ 목적지 삭제 성공")
    } catch (error) {
      throw error
    }
  }

  // 목적지 순서 변경
  async updateDestinationSequence(dayId: number, orderedDestinationIds: number[]): Promise<{ data: TripDayWithDestinationsDto }> {
    log("🔄 TripService.updateDestinationSequence 호출됨:", { dayId, orderedDestinationIds })

    // dayId 유효성 검증
    if (!dayId) {
      const error = new Error("dayId is required")
      throw error
    }

    // orderedDestinationIds 유효성 검증
    if (!Array.isArray(orderedDestinationIds) || orderedDestinationIds.length === 0) {
      const error = new Error("orderedDestinationIds must be a non-empty array")
      throw error
    }

    const requestData: UpdateSequenceRequest = {
      tripDayId: dayId,
      orderedDestinationIds,
    }

    try {
      const response = await apiClient.put<TripDayWithDestinationsDto>(`/api/trip-days/${dayId}/destinations/sequence`, requestData)
      log("✅ 목적지 순서 변경 성공:", response.data)
      return response
    } catch (error) {
      throw error
    }
  }

  // 여행 비용 조회
  async getTripCosts(planId: number): Promise<{ data: CostDto[] }> {
    log("💰 TripService.getTripCosts 호출됨:", { planId })

    try {
      const response = await apiClient.get<CostDto[]>(`/api/trip-plans/${planId}/costs`)
      log("✅ 여행 비용 조회 성공:", response.data?.length || 0, "개")
      return response
    } catch (error) {
      throw error
    }
  }

  // 완전한 여행 계획 저장 (여행 계획 + 일정 + 목적지)
  async saveCompleteItinerary(
    planName: string,
    startDate: string,
    endDate: string,
    selectedPlaces: any[],
    selectedAccommodations: any[],
  ): Promise<{ data: TripPlanDto }> {
    log("💾 TripService.saveCompleteItinerary 호출됨:", {
      planName,
      startDate,
      endDate,
      placesCount: selectedPlaces.length,
      accommodationsCount: selectedAccommodations.length,
    })

    try {
      // 1. 여행 계획 생성
      const tripPlanResponse = await this.createTripPlan(planName, startDate, endDate)
      const tripPlan = tripPlanResponse.data
      log("✅ 1단계: 여행 계획 생성 완료:", tripPlan.id)

      // 2. 여행 기간 계산
      const start = new Date(startDate)
      const end = new Date(endDate)
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // 3. 각 일차별로 일정 생성
      const tripDays: TripDayDto[] = []
      for (let day = 1; day <= totalDays; day++) {
        const dayDate = new Date(start)
        dayDate.setDate(dayDate.getDate() + day - 1)
        const dateString = dayDate.toISOString().split("T")[0]

        const tripDayResponse = await this.addTripDay(tripPlan.id, dateString)
        tripDays.push(tripDayResponse.data)
        log(`✅ ${day}일차 일정 생성 완료:`, tripDayResponse.data.id)
      }

      // 4. 각 일차별로 목적지 추가
      for (let day = 1; day <= totalDays; day++) {
        const tripDay = tripDays[day - 1]
        let sequence = 1

        // 숙소 추가
        const dayAccommodations = selectedAccommodations.filter((acc) => {
          const checkInDate = new Date(acc.checkInDate)
          const dayDate = new Date(start)
          dayDate.setDate(dayDate.getDate() + day - 1)
          return checkInDate.toDateString() === dayDate.toDateString()
        })

        for (const accommodation of dayAccommodations) {
          await this.addDestination(
            tripDay.id,
            accommodation.place.id || `acc-${accommodation.place.name}`,
            "accommodation",
            sequence++,
            1440, // 24시간
            null,
            accommodation.room?.price || 0,
          )
          log(`✅ ${day}일차 숙소 추가:`, accommodation.place.name)
        }

        // 관광지 추가
        const dayPlaces = selectedPlaces.filter((sp) => sp.dayNumber === day)
        for (const selectedPlace of dayPlaces) {
          await this.addDestination(
            tripDay.id,
            selectedPlace.place.contentid || selectedPlace.place.id,
            "attraction",
            sequence++,
            60, // 1시간
            null,
            0,
          )
          log(`✅ ${day}일차 관광지 추가:`, selectedPlace.place.title || selectedPlace.place.name)
        }
      }

      log("🎉 완전한 여행 계획 저장 완료!")
      return tripPlanResponse
    } catch (error) {
      throw error
    }
  }

  // 여행 계획 삭제
  async deleteTripPlan(planId: number): Promise<void> {
    log("🗑️ TripService.deleteTripPlan 호출됨:", { planId })

    try {
      await apiClient.delete(`/api/trip-plans/${planId}`)
      log("✅ 여행 계획 삭제 성공")
    } catch (error) {
      throw error
    }
  }
}

export const tripService = new TripService()

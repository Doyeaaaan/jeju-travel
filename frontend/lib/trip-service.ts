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

    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error("로그인이 필요합니다.")
    }

    try {
      // GET /api/trip-plans/my-plans API 호출 (사용자별 여행 계획 목록)
      const response = await apiClient.get<any>("/api/trip-plans/my-plans")

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
    
    try {
      // 백엔드는 ApiResponse 래퍼 없이 직접 List<TripPlanDto>를 반환
      const response = await apiClient.get<any>("/api/trip-plans/my-plans")
      
      // response가 직접 배열이면 그대로 사용
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      // response.data가 있으면 사용
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data }
      }
      
      // 그 외의 경우 response 자체를 확인
      return { data: [] }
    } catch (error) {
      throw error
    }
  }

  // 플랜 상세 조회 (일차별 일정 + 목적지 포함)
  async getPlanDays(planId: number): Promise<{ data: TripDayWithDestinationsDto[] }> {
    
    try {
      // 백엔드는 ApiResponse<List<TripDayWithDestinationsDto>>를 반환
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days-with-dests`)
      
      // response.data.data가 실제 TripDayWithDestinationsDto[] 배열
      return { data: response.data.data || response.data }
    } catch (error) {
      throw error
    }
  }

  // 여행 계획 생성
  async createTripPlan(planName: string, startDate: string, endDate: string): Promise<{ data: TripPlanDto }> {

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

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}`)

      // API 응답 구조에 맞게 데이터 추출
      const tripPlanData = response.data || response

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

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days-with-dests`)

      // API 응답이 배열인지 객체인지 확인
      let daysData = response.data || response
      if (daysData && !Array.isArray(daysData)) {
        // 응답이 객체 형태라면 days 배열 추출
        daysData = daysData.days || daysData.tripDays || []
      }


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

    try {
      const response = await apiClient.get<any>(`/api/trip-plans/${planId}/days`)

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

    // LocalDate 형식으로 변환 (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0]

    const requestData: AddTripDayRequest = {
      date: formattedDate,
    }

    try {
      const response = await apiClient.post<any>(`/api/trip-plans/${planId}/days`, requestData)

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

    try {
      const response = await apiClient.get<DestinationDto[]>(`/api/trip-days/${dayId}/destinations`)
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
      return response
    } catch (error) {
      throw error
    }
  }

  // 목적지 삭제
  async removeDestination(dayId: number, destId: number): Promise<void> {

    try {
      await apiClient.delete(`/api/trip-days/${dayId}/destinations/${destId}`)
    } catch (error) {
      throw error
    }
  }

  // 목적지 순서 변경
  async updateDestinationSequence(dayId: number, orderedDestinationIds: number[]): Promise<{ data: TripDayWithDestinationsDto }> {

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
      return response
    } catch (error) {
      throw error
    }
  }

  // 여행 비용 조회
  async getTripCosts(planId: number): Promise<{ data: CostDto[] }> {

    try {
      const response = await apiClient.get<CostDto[]>(`/api/trip-plans/${planId}/costs`)
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
        }
      }

      return tripPlanResponse
    } catch (error) {
      throw error
    }
  }

  // 여행 계획 삭제
  async deleteTripPlan(planId: number): Promise<void> {

    try {
      await apiClient.delete(`/api/trip-plans/${planId}`)
    } catch (error) {
      throw error
    }
  }
}

export const tripService = new TripService()

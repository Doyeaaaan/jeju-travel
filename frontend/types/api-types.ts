// 기본 사용자 정보
export interface User {
  id: number
  nickname: string
  email: string
  profileImage?: string
  role?: string
  provider?: "GOOGLE" | "KAKAO"
  createdAt?: string
  updatedAt?: string
}

// 로그인 요청
export interface LoginRequestDto {
  email: string
  password: string
}

// 로그인 응답
export interface LoginResponseDto {
  grantType: string
  accessToken: string
  accessTokenExpirationTime: number
  refreshToken: string
  refreshTokenExpirationTime: number
}

// 회원가입 요청
export interface JoinRequestDto {
  email: string
  password: string
  nickname: string
}

// OAuth2 회원가입 요청
export interface OAuth2JoinRequestDto {
  email: string
  nickname: string
  code: string
}

// 이메일 DTO
export interface EmailDto {
  email: string
}

// 인증 코드 검증 DTO
export interface VerifyCodeDto {
  email: string
  code: string
}

// 토큰 재발급 요청
export interface ReissueRequestDto {
  refreshToken: string
}

// 마이페이지 응답
export interface MypageResponseDto {
  email: string
  nickname: string
  profileImage: string | null
  posts: PostDto[]
  comments: CommentResponseDto[]
  favorites: FavoriteDto[]
  friends: FriendDto[]
}

// 게시글 DTO
export interface PostDto {
  id: number
  title: string
  content: string
  like: number
  commentCount: number
  views: number
  hasImage: boolean
  createdAt: string
  images?: ImageDto[]
}

// 페이지 응답 DTO
export interface PageResponseDto {
  posts: PostDto[]
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
}

// 댓글 DTO
export interface CommentDto {
  id: number
  content: string
  createdAt: string
}

// 즐겨찾기 DTO
export interface FavoriteDto {
  id: number
  placeId: number
  type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST"
}

// 친구 DTO
export interface FriendDto {
  friendId: number
  userId: number
  nickname: string
  profileImage: string | null
}

// 이미지 DTO
export interface ImageDto {
  id: number
  url: string
}

// 프로필 수정 DTO
export interface ProfileUpdateDto {
  nickname?: string
  password?: string
  deleteProfileImage?: boolean
}

export interface CommentResponseDto {
  id: number
  content: string
  userId: number
  nickname?: string
  createdAt: string
  updatedAt: string
  profileImage?: string
  isWriter: boolean
  postId: number
  postTitle: string
}

export interface PostImage {
  id: number
  url: string
}

export interface PostDetailResponseDto {
  id: number
  title: string
  content: string
  userId: number
  nickname?: string
  createdAt: string
  updatedAt: string
  profileImage?: string
  images: PostImage[]
  comments: CommentResponseDto[]
  like: number
  isLiked: boolean
  isWriter: boolean
}

export interface PageResponseDto {
  content: PostDetailResponseDto[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface PostRequestDto {
  title: string
  content: string
}

export interface PostUpdateDto extends PostRequestDto {
  planId?: number
  deleteImages?: number[]
}

// 친구 요청 DTO
export interface FriendRequestDto {
  requestId: number
  userId: number
  nickname: string
  profileImage?: string
  requestedAt: string
}

// 친구 응답 DTO
export interface FriendResponseDto {
  friendId: number
  userId: number
  nickname: string
  profileImage?: string
}

// 사용자 DTO
export interface UserDto {
  id: number
  email: string
  nickname: string
  profileImage?: string
}

// 여행 계획 관련 타입들
export interface TripPlanDto {
  id: number
  planName: string
  startDate: string
  endDate: string
  days?: TripDayDto[]
  createdAt?: string
  updatedAt?: string
}

export interface TripDayDto {
  id: number
  dayNumber: number
  date: string
  destinations?: DestinationDto[]
}

export interface TripDayWithDestinationsDto {
  tripDayId: number
  dayNumber: number
  date: string
  destinations: DestinationDto[]
}

export interface DestinationDto {
  id: number
  sequence: number
  placeId: string
  type: string
  duration: number
  transportation?: string
  price?: number
  placeName?: string
  placeAddress?: string
  placeImage?: string
  latitude?: number
  longitude?: number
}

export interface CreateTripPlanRequest {
  planName: string
  startDate: string
  endDate: string
}

export interface AddTripDayRequest {
  date: string
}

export interface CreateDestinationRequest {
  tripDayId: number
  sequence: number
  placeId: string
  type: string
  duration: number
  transportation?: string
  price?: number
}

export interface UpdateSequenceRequest {
  tripDayId: number
  orderedDestinationIds: number[]
}

export interface CostDto {
  id: number
  category: string
  amount: number
  description?: string
  date: string
}

// 여행 일정 공유 관련 타입들 (실제 백엔드 API에 맞춤)

/**
 * 내 여행 계획 목록 응답 스키마: GET /api/trip-plans/my-plans
 * Response: List<TripPlanDto> (직접 배열 반환, ApiResponse 래핑 없음)
 */
export interface MyTripPlan {
  id: number
  planName: string
  startDate: string // ISO
  endDate: string   // ISO
  createdAt?: string
  updatedAt?: string
}

/**
 * 친구 목록 응답 스키마: GET /api/friend
 * Response: ApiResponse<List<FriendResponseDto>>
 */
export interface FriendResponse {
  friendId: number
  userId: number
  nickname: string
  profileImage?: string | null
}

/**
 * 일정 복제 공유 요청 스키마: POST /api/trip-plans/{planId}/share
 * Body: { "friendIds": [1, 2, 3] }
 */
export interface TripPlanShareRequest {
  friendIds: number[]
}

/**
 * 일정 복제 공유 응답 스키마
 * Response: ApiResponse<TripPlanShareCloneResponse>
 */
export interface TripPlanShareResponse {
  sharedTo: Array<{
    friendId: number
    newPlanId: number
  }>
  failed: Array<{
    friendId: number
    reason: string
  }>
}

/**
 * 공유된 일정 목록 응답 스키마: GET /api/plan/shared
 * Response: ApiResponse<List<PlanShareResponseDto>>
 */
export interface SharedPlan {
  id: number
  planName: string
  startDate: string
  endDate: string
  sharedBy?: string
  sharedAt?: string
  permission?: string
}

/**
 * 기존 API 응답 래퍼 (일부 API에서 사용)
 */
export interface ApiResponse<T> {
  status: string
  message: string
  data?: T
}

/**
 * 공통 응답 타입 (래핑되거나 직접 반환)
 */
export type ApiResponseOrDirect<T> = ApiResponse<T> | T

// 키워드 기반 추천 관련 타입들
export interface KeywordRecommendationRequest {
  startDate: string
  endDate: string
  travelers: number
  keywords: {
    관광지: string[]
    맛집: string[]
    숙소: string[]
    카페?: string[]
  }
  numOptions: number
}

export interface RecommendationItem {
  label: string
  category: string
  placeId: string
  slot: string
}

export interface RecommendationDay {
  day: number
  items: RecommendationItem[]
}

export interface RecommendationOption {
  title: string
  days: RecommendationDay[]
}

export interface KeywordRecommendationResponse {
  success: boolean
  data: {
    startDate: string
    endDate: string
    travelers: number
    selectedKeywords: {
      관광지: string[]
      맛집: string[]
      숙소: string[]
      카페?: string[]
    }
    options: RecommendationOption[]
  }
  error: any
}

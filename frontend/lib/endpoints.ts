/*
백엔드 스펙 확인 결과:
1. 내 일정 목록: GET /api/trip-plans/my-plans → List<TripPlanDto>
2. 친구 목록: GET /api/friend → ApiResponse<List<FriendResponseDto>>
3. 일정 복제 공유: POST /api/trip-plans/{planId}/share → ApiResponse<TripPlanShareCloneResponse>
4. 개별 친구 공유: POST /api/trip-plans/{planId}/share-with-friend → ApiResponse<...>
5. 친구요청: GET /api/friend/request/received, GET /api/friend/request/sent → ApiResponse<List<FriendRequestDto>>
*/

export const ENDPOINTS = {
  // 여행 계획
  myTripPlans: "/api/trip-plans/my-plans",
  
  // 친구
  friends: "/api/friend",
  
  // 공유
  shareClone: (planId: number) => `/api/trip-plans/${planId}/share`,
  shareWithFriend: (planId: number) => `/api/trip-plans/${planId}/share-with-friend`,
  
  // 친구요청
  friendRequests: {
    received: "/api/friend/request/received",
    sent: "/api/friend/request/sent",
  },
  
  // 공유된 일정
  sharedPlans: "/api/trip-plans/shared-with-me",
} as const;
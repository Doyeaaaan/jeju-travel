import { apiClient } from "./api-client"
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
import type { UserDto } from "@/types/api-types"

export interface Friend {
  id: number
  friendId: number
  userId: number
  nickname: string
  email: string
  profileImage?: string
}

export interface FriendRequest {
  requestId: number
  userId: number
  nickname: string
  profileImage?: string
  requestedAt: string
}

export class FriendService {
  // 친구 목록 조회
  async getFriends(): Promise<Friend[]> {
    try {
      const response = await apiClient.get<Friend[]>("/api/friend", true)
      return response.data || []
    } catch (error) {
      return []
    }
  }

  // 받은 친구 요청 목록 조회
  async getReceivedFriendRequests(): Promise<FriendRequest[]> {
    try {
      const response = await apiClient.get<FriendRequest[]>("/api/friend/request/received", true)
      return response.data || []
    } catch (error) {
      return []
    }
  }

  // 보낸 친구 요청 목록 조회
  async getSentFriendRequests(): Promise<FriendRequest[]> {
    try {
      const response = await apiClient.get<FriendRequest[]>("/api/friend/request/sent", true)
      return response.data || []
    } catch (error) {
      return []
    }
  }

  // (호환용 래퍼) 기존 호출부가 getFriendRequests()를 부르면 받은 요청과 보낸 요청을 합쳐 반환
  async getFriendRequests(): Promise<{ received: FriendRequest[]; sent: FriendRequest[] }> {
    try {
      const [received, sent] = await Promise.all([
        this.getReceivedFriendRequests(),
        this.getSentFriendRequests(),
      ])
      return { received, sent }
    } catch (error) {
      return { received: [], sent: [] }
    }
  }

  // 친구 추가 요청
  async addFriend(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      // 먼저 이메일로 사용자 ID를 찾아야 함
      const user = await this.searchUserByEmail(email)
      if (!user) {
        return { success: false, message: "존재하지 않는 사용자입니다." }
      }
      
      await apiClient.post("/api/friend", user.id, true)
      return { success: true }
    } catch (error: any) {
      
      // 409 Conflict 에러 처리 (중복된 친구 요청)
      if (error.status === 409) {
        return { success: false, message: "이미 친구 요청을 보냈거나 친구 관계가 존재합니다." }
      }
      
      // 기타 에러 처리
      return { success: false, message: error.message || "친구 추가 요청에 실패했습니다." }
    }
  }

  // 친구 요청 수락
  async acceptFriendRequest(requestId: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/friend/request/${requestId}/accept`, {}, true)
      return true
    } catch (error) {
      return false
    }
  }

  // 친구 요청 거절
  async rejectFriendRequest(requestId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/friend/request/${requestId}/reject`, true)
      return true
    } catch (error) {
      return false
    }
  }

  // 친구 삭제
  async deleteFriend(friendId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/friend/${friendId}`, true)
      return true
    } catch (error: any) {
        message: error.message,
        status: error.status,
        response: error.response
      })
      return false
    }
  }

  // 친구 요청 취소
  async cancelFriendRequest(requestId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/friend/request/${requestId}`, true)
      return true
    } catch (error) {
      return false
    }
  }

  // 이메일로 사용자 검색
  async searchUserByEmail(email: string): Promise<UserDto | null> {
    try {
      const response = await apiClient.get<UserDto>(`/api/user/search?email=${encodeURIComponent(email)}`, true)
      return response.data || null
    } catch (error) {
      return null
    }
  }
}

export const friendService = new FriendService()

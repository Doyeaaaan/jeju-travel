import { apiClient, type ApiResponse } from "./api-client"
import type { MypageResponseDto } from "@/types/api-types"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

export class UserService {
  // 마이페이지 정보 조회
  async getMypage(): Promise<ApiResponse<MypageResponseDto>> {
    const response = await apiClient.get<MypageResponseDto>("/api/user/mypage")
    return {
      status: "success",
      message: "마이페이지 정보 조회 성공",
      data: response.data
    }
  }

  // 프로필 수정
  async updateProfile(nickname: string, image?: File): Promise<ApiResponse<any>> {
    
    const formData = new FormData()

    // 백엔드에서 기대하는 형식으로 데이터 구성
    const profileData = {
      nickname: nickname
    }
    
    formData.append("data", new Blob([JSON.stringify(profileData)], {
      type: "application/json"
    }))

    if (image) {
      formData.append("image", image)
    }

    
    // 백엔드 엔드포인트와 HTTP 메서드 수정
    const result = await apiClient.patchFormData<any>("/api/user/mypage", formData)
    
    return result
  }

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>("/api/user/password", {
      currentPassword,
      newPassword,
    })
  }

  // 회원탈퇴
  async deleteAccount(): Promise<ApiResponse<any>> {
    return apiClient.delete<any>("/api/user")
  }
}

export const userService = new UserService()

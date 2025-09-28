import { apiClient } from "./api-client";
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
import type { FavoriteDto } from "../types/api-types";

export interface FavoriteRequest {
  placeId: number;
  type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST";
}

export interface FavoriteResponse {
  id: number;
  placeId: number;
  type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST";
  userId: number;
  createdAt: string;
}

class FavoriteService {
  // 좋아요 추가
  async addFavorite(placeId: number, type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST"): Promise<FavoriteResponse> {
    log("❤️ 좋아요 추가:", { placeId, type });
    
    const request: FavoriteRequest = { placeId, type };
    const response = await apiClient.post<FavoriteResponse>("/api/favorites", request, true);
    
    if (response.data) {
      log("✅ 좋아요 추가 성공:", response.data);
      return response.data;
    } else {
      throw new Error(response.message || "좋아요 추가에 실패했습니다.");
    }
  }

  // 좋아요 제거
  async removeFavorite(placeId: number, type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST"): Promise<void> {
    log("💔 좋아요 제거:", { placeId, type });
    
    const response = await apiClient.delete(`/api/favorites/${placeId}/${type}`, true);
    
    if (response.status === "200 OK") {
      log("✅ 좋아요 제거 성공");
    } else {
      throw new Error(response.message || "좋아요 제거에 실패했습니다.");
    }
  }

  // 사용자의 좋아요 목록 조회
  async getFavorites(): Promise<FavoriteDto[]> {
    log("📋 좋아요 목록 조회");
    
    const response = await apiClient.get<FavoriteDto[]>("/api/favorites", true);
    
    if (response.data) {
      log("✅ 좋아요 목록 조회 성공:", response.data);
      return response.data;
    } else {
      log("📋 좋아요 목록이 비어있습니다.");
      return [];
    }
  }

  // 특정 장소의 좋아요 상태 확인
  async isFavorite(placeId: number, type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST"): Promise<boolean> {
    log("🔍 좋아요 상태 확인:", { placeId, type });
    
    try {
      const favorites = await this.getFavorites();
      const isFavorited = favorites.some(
        favorite => favorite.placeId === placeId && favorite.type === type
      );
      
      log("🔍 좋아요 상태:", isFavorited);
      return isFavorited;
    } catch (error) {
      return false;
    }
  }

  // 좋아요 토글 (추가/제거)
  async toggleFavorite(placeId: number, type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST"): Promise<boolean> {
    log("🔄 좋아요 토글:", { placeId, type });
    
    try {
      const isFavorited = await this.isFavorite(placeId, type);
      
      if (isFavorited) {
        await this.removeFavorite(placeId, type);
        return false; // 좋아요 제거됨
      } else {
        await this.addFavorite(placeId, type);
        return true; // 좋아요 추가됨
      }
    } catch (error) {
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService();

"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { favoriteService } from "@/lib/favorite-service";
import { useAuth } from "@/context/AuthContext";

// 장소 정보 헬퍼 함수들
const getPlaceName = (placeId: number, type: string): string => {
  const placeNames: Record<string, Record<number, string>> = {
    TOURIST: {
      1: "성산일출봉",
      2: "협재해수욕장", 
      3: "한라산 국립공원",
      4: "만장굴",
      5: "천지연폭포",
      6: "우도",
      7: "중문관광단지",
      8: "제주올레길",
      9: "테디베어뮤지엄",
      10: "제주민속촌"
    },
    RESTAURANT: {
      1: "제주 흑돼지 맛집",
      2: "해녀의 집",
      3: "제주 해산물 맛집",
      4: "갈치조림 맛집",
      5: "제주 감귤 맛집",
      6: "제주 한라봉 맛집",
      7: "제주 말고기 맛집",
      8: "제주 전통 맛집",
      9: "제주 바다 맛집",
      10: "제주 산채 맛집"
    },
    ACCOMMODATION: {
      1: "제주 리조트",
      2: "제주 펜션",
      3: "제주 호텔",
      4: "제주 게스트하우스",
      5: "제주 민박",
      6: "제주 바다뷰 펜션",
      7: "제주 산뷰 펜션",
      8: "제주 전통 한옥",
      9: "제주 캠핑장",
      10: "제주 글램핑"
    }
  };
  
  return placeNames[type]?.[placeId] || `${type} ${placeId}`;
};

const getPlaceAddress = (placeId: number, type: string): string => {
  const addresses: Record<string, Record<number, string>> = {
    TOURIST: {
      1: "제주특별자치도 서귀포시 성산읍 성산리",
      2: "제주특별자치도 제주시 한림읍 협재리",
      3: "제주특별자치도 제주시 해안동",
      4: "제주특별자치도 제주시 조천읍 교래리",
      5: "제주특별자치도 서귀포시 서귀동",
      6: "제주특별자치도 제주시 우도면",
      7: "제주특별자치도 서귀포시 중문관광단지",
      8: "제주특별자치도 제주시 애월읍",
      9: "제주특별자치도 서귀포시 중문관광단지",
      10: "제주특별자치도 서귀포시 표선면"
    },
    RESTAURANT: {
      1: "제주특별자치도 제주시 연동",
      2: "제주특별자치도 제주시 구좌읍",
      3: "제주특별자치도 제주시 한림읍",
      4: "제주특별자치도 서귀포시 서귀동",
      5: "제주특별자치도 제주시 애월읍",
      6: "제주특별자치도 제주시 조천읍",
      7: "제주특별자치도 제주시 한경면",
      8: "제주특별자치도 서귀포시 성산읍",
      9: "제주특별자치도 제주시 우도면",
      10: "제주특별자치도 서귀포시 남원읍"
    },
    ACCOMMODATION: {
      1: "제주특별자치도 서귀포시 중문관광단지",
      2: "제주특별자치도 제주시 애월읍",
      3: "제주특별자치도 제주시 연동",
      4: "제주특별자치도 제주시 구좌읍",
      5: "제주특별자치도 서귀포시 성산읍",
      6: "제주특별자치도 제주시 한림읍",
      7: "제주특별자치도 제주시 조천읍",
      8: "제주특별자치도 서귀포시 표선면",
      9: "제주특별자치도 제주시 우도면",
      10: "제주특별자치도 서귀포시 남원읍"
    }
  };
  
  return addresses[type]?.[placeId] || "제주특별자치도";
};

const getPlaceCategory = (type: string): string => {
  const categories: Record<string, string> = {
    TOURIST: "관광지",
    RESTAURANT: "맛집", 
    ACCOMMODATION: "숙소"
  };
  
  return categories[type] || "기타";
};

interface FavoriteButtonProps {
  placeId: number;
  type: "ACCOMMODATION" | "RESTAURANT" | "TOURIST";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function FavoriteButton({
  placeId,
  type,
  size = "md",
  showText = false,
  className = "",
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 크기별 스타일 설정
  const sizeClasses = {
    sm: {
      button: "p-1.5",
      icon: "w-4 h-4",
      text: "text-xs"
    },
    md: {
      button: "p-2",
      icon: "w-5 h-5", 
      text: "text-sm"
    },
    lg: {
      button: "p-3",
      icon: "w-6 h-6",
      text: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  // 초기 좋아요 상태 확인
  useEffect(() => {
    if (!isAuthenticated || !placeId || isNaN(placeId)) {
      setIsInitialized(true);
      return;
    }

    const checkFavoriteStatus = async () => {
      try {
        setIsLoading(true);
        const favorited = await favoriteService.isFavorite(placeId, type);
        setIsFavorited(favorited);
      } catch (error) {
        setIsFavorited(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkFavoriteStatus();
  }, [placeId, type, isAuthenticated]);

  // 좋아요 토글 핸들러
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation(); // 이벤트 버블링 방지


    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!placeId || isNaN(placeId)) {
      alert("유효하지 않은 장소입니다.");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const newFavoriteStatus = await favoriteService.toggleFavorite(placeId, type);
      setIsFavorited(newFavoriteStatus);
      
      // 즐겨찾기 추가 시 localStorage에 저장
      if (newFavoriteStatus) {
        const favoriteData = {
          id: placeId,
          placeId: `CNTS_${placeId.toString().padStart(3, '0')}`,
          placeName: getPlaceName(placeId, type),
          placeAddress: getPlaceAddress(placeId, type),
          placeCategory: getPlaceCategory(type),
          createdAt: new Date().toISOString()
        };
        
        // 기존 즐겨찾기 데이터 가져오기
        const existingFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        
        // 중복 확인 후 추가
        const isDuplicate = existingFavorites.some((fav: any) => fav.id === placeId);
        if (!isDuplicate) {
          existingFavorites.push(favoriteData);
          localStorage.setItem('userFavorites', JSON.stringify(existingFavorites));
        }
      } else {
        // 즐겨찾기 제거 시 localStorage에서 삭제
        const existingFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const updatedFavorites = existingFavorites.filter((fav: any) => fav.id !== placeId);
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      }
      
    } catch (error) {
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          alert("로그인이 필요합니다.");
        }}
        className={`
          ${currentSize.button}
          flex items-center gap-1.5
          text-gray-400 hover:text-gray-600
          transition-colors duration-200
          ${className}
        `}
        title="로그인이 필요합니다"
      >
        <Heart className={currentSize.icon} />
        {showText && (
          <span className={currentSize.text}>좋아요</span>
        )}
      </button>
    );
  }

  // 로딩 중
  if (!isInitialized || isLoading) {
    return (
      <button
        className={`
          ${currentSize.button}
          flex items-center gap-1.5
          text-gray-300
          cursor-not-allowed
          ${className}
        `}
        disabled
      >
        <Heart className={`${currentSize.icon} animate-pulse`} />
        {showText && (
          <span className={currentSize.text}>로딩중...</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        ${currentSize.button}
        flex items-center gap-1.5
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${isFavorited 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${className}
      `}
      title={isFavorited ? "좋아요 취소" : "좋아요"}
    >
      <Heart 
        className={`
          ${currentSize.icon}
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
        `} 
      />
      {showText && (
        <span className={currentSize.text}>
          {isFavorited ? "좋아요" : "좋아요"}
        </span>
      )}
    </button>
  );
}

// 간단한 하트 아이콘만 표시하는 버전
export function FavoriteIcon({
  placeId,
  type,
  size = "md",
  className = "",
}: Omit<FavoriteButtonProps, 'showText'>) {
  return (
    <FavoriteButton
      placeId={placeId}
      type={type}
      size={size}
      showText={false}
      className={className}
    />
  );
}

// 텍스트와 함께 표시하는 버전
export function FavoriteButtonWithText({
  placeId,
  type,
  size = "md",
  className = "",
}: Omit<FavoriteButtonProps, 'showText'>) {
  return (
    <FavoriteButton
      placeId={placeId}
      type={type}
      size={size}
      showText={true}
      className={className}
    />
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface ProfileDisplayProps {
  showNickname?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function ProfileDisplay({
  showNickname = true,
  size = "md",
  className = "",
  autoRefresh = true,
  refreshInterval = 30000, // 30초마다 자동 갱신
}: ProfileDisplayProps) {
  const { user } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [imageKey, setImageKey] = useState<number>(0);

  // 이미지 URL 생성 함수 (캐싱 방지)
  const generateImageUrl = useCallback((baseUrl: string) => {
    const timestamp = new Date().getTime();
    const randomKey = Math.random().toString(36).substring(7);
    return `${baseUrl}?t=${timestamp}&k=${randomKey}`;
  }, []);

  // 프로필 이미지 URL 업데이트
  const updateProfileImage = useCallback(() => {
    if (user?.profileImage) {
      const newUrl = generateImageUrl(user.profileImage);
      setProfileImageUrl(newUrl);
      setImageKey(prev => prev + 1);
    } else {
      setProfileImageUrl("/placeholder.svg");
    }
  }, [user?.profileImage, generateImageUrl]);

  // 초기 이미지 설정
  useEffect(() => {
    updateProfileImage();
  }, [updateProfileImage]);

  // 자동 갱신 설정
  useEffect(() => {
    if (!autoRefresh || !user?.profileImage) return;

    const interval = setInterval(() => {
      updateProfileImage();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, updateProfileImage, user?.profileImage]);

  // 사용자 정보 변경 감지
  useEffect(() => {
    updateProfileImage();
  }, [user?.id, user?.profileImage, updateProfileImage]);

  // 크기별 스타일 설정
  const sizeClasses = {
    sm: {
      image: "w-6 h-6",
      text: "text-xs",
      container: "gap-1"
    },
    md: {
      image: "w-8 h-8",
      text: "text-sm",
      container: "gap-2"
    },
    lg: {
      image: "w-12 h-12",
      text: "text-base",
      container: "gap-3"
    }
  };

  const currentSize = sizeClasses[size];

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className={`flex items-center ${currentSize.container} ${className}`}>
        <div className={`${currentSize.image} rounded-full bg-gray-200 flex items-center justify-center`}>
          <span className="text-gray-400 text-xs">?</span>
        </div>
        {showNickname && (
          <span className={`${currentSize.text} text-gray-500`}>로그인 필요</span>
        )}
      </div>
    );
  }

  // 디버깅: 사용자 정보 로그
    user,
    nickname: user.nickname,
    hasNickname: !!user.nickname,
    nicknameType: typeof user.nickname
  });

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* 프로필 이미지 */}
      <div className={`${currentSize.image} rounded-full overflow-hidden relative bg-gray-100`}>
        <Image
          key={imageKey} // key를 사용하여 강제 리렌더링
          src={profileImageUrl}
          alt={`${user.nickname}의 프로필 이미지`}
          fill
          className="object-cover"
          onError={(e) => {
            // 이미지 로드 실패 시 placeholder로 대체
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
          onLoad={() => {
          }}
        />
      </div>

      {/* 닉네임 */}
      {showNickname && (
        <span className={`${currentSize.text} font-medium text-gray-800 truncate max-w-32`}>
          {user.nickname || user.email?.split("@")[0] || "사용자"}
        </span>
      )}
    </div>
  );
}

// 프로필 이미지만 표시하는 간단한 버전
export function ProfileImageOnly({ 
  size = "md", 
  className = "",
  autoRefresh = true 
}: Omit<ProfileDisplayProps, 'showNickname'>) {
  return (
    <ProfileDisplay 
      showNickname={false} 
      size={size} 
      className={className}
      autoRefresh={autoRefresh}
    />
  );
}

// 닉네임만 표시하는 버전
export function ProfileNicknameOnly({ 
  size = "md", 
  className = "" 
}: Omit<ProfileDisplayProps, 'showNickname' | 'autoRefresh' | 'refreshInterval'>) {
  const { user } = useAuth();
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  if (!user) {
    return (
      <span className={`${sizeClasses[size]} text-gray-500 ${className}`}>
        로그인 필요
      </span>
    );
  }

  return (
    <span className={`${sizeClasses[size]} font-medium text-gray-800 ${className}`}>
      {user.nickname || user.email?.split("@")[0] || "사용자"}
    </span>
  );
}

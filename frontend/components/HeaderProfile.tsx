"use client";

import { useAuth } from "@/context/AuthContext";
import ProfileDisplay from "./ProfileDisplay";
import ProfileDropdown from "../profile-dropdown";

/**
 * 헤더에서 사용할 프로필 컴포넌트
 * - 로그인 상태에 따라 다른 UI 표시
 * - 프로필 이미지와 닉네임을 함께 표시
 * - 드롭다운 메뉴 포함
 */
export default function HeaderProfile() {
  const { user, isAuthenticated } = useAuth();

  // 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <ProfileDisplay 
          showNickname={false} 
          size="sm" 
          className="opacity-50"
        />
        <span className="text-sm text-gray-500">로그인</span>
      </div>
    );
  }

  // 로그인한 경우 - 드롭다운 메뉴와 함께 표시
  return (
    <div className="flex items-center">
      <ProfileDropdown />
    </div>
  );
}

/**
 * 간단한 프로필 표시만 필요한 경우
 * 드롭다운 없이 프로필 이미지와 닉네임만 표시
 */
export function SimpleHeaderProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <ProfileDisplay 
        showNickname={true} 
        size="sm" 
        className="opacity-50"
      />
    );
  }

  return (
    <ProfileDisplay 
      showNickname={true} 
      size="md" 
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}

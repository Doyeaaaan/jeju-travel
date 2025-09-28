"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

/**
 * 사용자 정보 디버깅 컴포넌트
 * 현재 사용자 정보와 localStorage 상태를 확인할 수 있습니다.
 */
export default function UserInfoDebug() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // localStorage에서 사용자 관련 데이터 가져오기
    const userData = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    setLocalStorageData({
      user: userData ? JSON.parse(userData) : null,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null,
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
    });
  }, [user]);

  if (authLoading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">🔍 사용자 정보 디버깅</h3>
        <p className="text-yellow-700">인증 상태 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <h3 className="font-semibold text-blue-800">🔍 사용자 정보 디버깅</h3>
      
      {/* AuthContext 상태 */}
      <div className="space-y-2">
        <h4 className="font-medium text-blue-700">AuthContext 상태:</h4>
        <div className="bg-white p-3 rounded border text-sm">
          <div><strong>isAuthenticated:</strong> {isAuthenticated ? "✅ true" : "❌ false"}</div>
          <div><strong>authLoading:</strong> {authLoading ? "⏳ true" : "✅ false"}</div>
          <div><strong>user:</strong> {user ? "✅ 존재" : "❌ null"}</div>
        </div>
      </div>

      {/* 사용자 정보 상세 */}
      {user && (
        <div className="space-y-2">
          <h4 className="font-medium text-blue-700">사용자 정보 상세:</h4>
          <div className="bg-white p-3 rounded border text-sm space-y-1">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Nickname:</strong> {user.nickname || "❌ 없음"}</div>
            <div><strong>Profile Image:</strong> {user.profileImage || "❌ 없음"}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>Provider:</strong> {user.provider || "일반"}</div>
            <div><strong>Created At:</strong> {user.createdAt}</div>
            <div><strong>Updated At:</strong> {user.updatedAt}</div>
          </div>
        </div>
      )}

      {/* localStorage 상태 */}
      <div className="space-y-2">
        <h4 className="font-medium text-blue-700">localStorage 상태:</h4>
        <div className="bg-white p-3 rounded border text-sm space-y-1">
          <div><strong>User Data:</strong> {localStorageData.user ? "✅ 존재" : "❌ 없음"}</div>
          {localStorageData.user && (
            <div className="ml-4 space-y-1">
              <div><strong>ID:</strong> {localStorageData.user.id}</div>
              <div><strong>Email:</strong> {localStorageData.user.email}</div>
              <div><strong>Nickname:</strong> {localStorageData.user.nickname || "❌ 없음"}</div>
            </div>
          )}
          <div><strong>Access Token:</strong> {localStorageData.hasAccessToken ? "✅ 존재" : "❌ 없음"}</div>
          <div><strong>Refresh Token:</strong> {localStorageData.hasRefreshToken ? "✅ 존재" : "❌ 없음"}</div>
          {localStorageData.accessTokenPreview && (
            <div><strong>Access Token Preview:</strong> {localStorageData.accessTokenPreview}</div>
          )}
        </div>
      </div>

      {/* 닉네임 생성 테스트 */}
      <div className="space-y-2">
        <h4 className="font-medium text-blue-700">닉네임 생성 테스트:</h4>
        <div className="bg-white p-3 rounded border text-sm">
          {user?.email ? (
            <div>
              <div><strong>이메일:</strong> {user.email}</div>
              <div><strong>생성된 닉네임:</strong> {user.email.split("@")[0]}</div>
              <div><strong>현재 닉네임:</strong> {user.nickname || "❌ 없음"}</div>
            </div>
          ) : (
            <div>❌ 이메일 정보가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-2">
        <h4 className="font-medium text-blue-700">디버깅 액션:</h4>
        <div className="flex gap-2">
          <button
            onClick={() => {
                user: localStorage.getItem("user"),
                accessToken: localStorage.getItem("accessToken"),
                refreshToken: localStorage.getItem("refreshToken"),
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            콘솔에 로그 출력
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { authService } from "@/lib/auth-service"

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>({})

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = authService.getAccessToken()
      const refreshToken = authService.getRefreshToken()
      const isAuthenticated = authService.isAuthenticated()
      const accessTokenExpiration = localStorage.getItem("accessTokenExpiration")
      const refreshTokenExpiration = localStorage.getItem("refreshTokenExpiration")
      const user = localStorage.getItem("user")

      setAuthInfo({
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
        isAuthenticated,
        accessTokenExpiration: accessTokenExpiration ? new Date(Number(accessTokenExpiration)).toLocaleString() : null,
        refreshTokenExpiration: refreshTokenExpiration ? new Date(Number(refreshTokenExpiration)).toLocaleString() : null,
        user: user ? JSON.parse(user) : null,
        currentTime: new Date().toLocaleString()
      })
    }

    checkAuth()
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const clearTokens = () => {
    authService.clearTokens()
    window.location.reload()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">인증 상태 디버깅</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">토큰 정보</h2>
          <div className="space-y-2">
            <p><strong>Access Token:</strong> {authInfo.accessToken || "없음"}</p>
            <p><strong>Refresh Token:</strong> {authInfo.refreshToken || "없음"}</p>
            <p><strong>인증 상태:</strong> 
              <span className={authInfo.isAuthenticated ? "text-green-600" : "text-red-600"}>
                {authInfo.isAuthenticated ? "로그인됨" : "로그인 안됨"}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">만료 시간</h2>
          <div className="space-y-2">
            <p><strong>Access Token 만료:</strong> {authInfo.accessTokenExpiration || "없음"}</p>
            <p><strong>Refresh Token 만료:</strong> {authInfo.refreshTokenExpiration || "없음"}</p>
            <p><strong>현재 시간:</strong> {authInfo.currentTime}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">사용자 정보</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authInfo.user, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <button 
          onClick={clearTokens}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          토큰 모두 삭제
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/auth-service"
import { toast } from "react-hot-toast"

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token")
        if (!token) {
          throw new Error("토큰이 없습니다.")
        }

        // 토큰 저장 및 사용자 정보 설정
        const tokenResponse = {
          grantType: "Bearer",
          accessToken: token,
          refreshToken: token, // 백엔드에서 refresh token도 따로 전달하면 그것을 사용
          accessTokenExpirationTime: Date.now() + 3600000, // 1시간
          refreshTokenExpirationTime: Date.now() + 86400000 // 24시간
        }
        
        authService.saveTokens(tokenResponse)
        toast.success("카카오 로그인 성공!")
        router.push("/")
      } catch (error: any) {
        toast.error(error.message || "카카오 로그인에 실패했습니다.")
        router.push("/login")
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">카카오 로그인 처리 중...</h2>
        <p className="text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}

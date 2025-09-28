"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function OAuth2CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { oauth2Login } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("OAuth2 인증을 처리하고 있습니다...")

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      try {
        // URL 파라미터에서 code와 provider 추출
        const code = searchParams.get("code")
        const provider = searchParams.get("provider") || "google" // 기본값
        const error = searchParams.get("error")

        if (error) {
          setStatus("error")
          setMessage(`OAuth2 인증 실패: ${error}`)
          return
        }

        if (!code) {
          setStatus("error")
          setMessage("인증 코드를 받지 못했습니다.")
          return
        }

        setMessage(`${provider} 로그인을 처리하고 있습니다...`)

        // OAuth2 로그인 시도
        const success = await oauth2Login(provider, code)
        
        if (success) {
          setStatus("success")
          setMessage("로그인이 완료되었습니다!")
          
          // 2초 후 홈으로 리다이렉트
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("로그인에 실패했습니다.")
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "OAuth2 인증 중 오류가 발생했습니다.")
      }
    }

    handleOAuth2Callback()
  }, [searchParams, oauth2Login, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">OAuth2 인증</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
                <p className="text-gray-600">{message}</p>
              </>
            )}
            
            {status === "success" && (
              <>
                <div className="h-8 w-8 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-sm text-gray-500">잠시 후 홈으로 이동합니다...</p>
              </>
            )}
            
            {status === "error" && (
              <>
                <div className="h-8 w-8 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{message}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push("/login")}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    로그인 페이지로 돌아가기
                  </Button>
                  <Button 
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full"
                  >
                    홈으로 이동
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

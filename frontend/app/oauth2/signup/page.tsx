"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/auth-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

export default function OAuth2SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // OAuth2 회원가입 폼 상태
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [provider, setProvider] = useState<"google" | "kakao">("google")
  const [code, setCode] = useState("")

  useEffect(() => {
    // URL 파라미터에서 정보 추출
    const urlProvider = searchParams.get("provider") as "google" | "kakao"
    const urlCode = searchParams.get("code")
    const urlEmail = searchParams.get("email")
    const urlNickname = searchParams.get("nickname")

    if (urlProvider) setProvider(urlProvider)
    if (urlCode) setCode(urlCode)
    if (urlEmail) setEmail(urlEmail)
    if (urlNickname) setNickname(urlNickname)

    // 필수 정보가 없으면 로그인 페이지로 리다이렉트
    if (!urlProvider || !urlCode) {
      router.push("/login")
    }
  }, [searchParams, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !nickname) {
      setError("이메일과 닉네임을 입력해주세요.")
      return
    }

    if (nickname.length < 2) {
      setError("닉네임은 2자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await authService.oauth2Signup(
        provider,
        email,
        nickname,
        code,
        profileImage || undefined
      )

      if (response) {
        toast.success("회원가입이 완료되었습니다!")
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || "회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {provider === "google" ? "구글" : "카카오"} 회원가입
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              추가 정보를 입력해주세요
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {provider === "google" ? "구글" : "카카오"}에서 가져온 이메일입니다
                </p>
              </div>

              <div>
                <Label htmlFor="nickname">닉네임 *</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력하세요 (2자 이상)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="profileImage">프로필 이미지 (선택사항)</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG 파일만 업로드 가능합니다
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      가입 중...
                    </>
                  ) : (
                    "회원가입 완료"
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/login")}
                  disabled={isLoading}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

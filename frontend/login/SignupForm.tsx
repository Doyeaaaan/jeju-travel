"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Upload } from "lucide-react"
import { authService } from "@/lib/auth-service"

interface SignupFormProps {
  onSignupSuccess?: () => void
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 이메일 인증 코드 전송
  const handleSendCode = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("올바른 이메일 형식을 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const cleanEmail = email.trim().toLowerCase()
      await authService.sendEmailCode(cleanEmail)

      setSentEmail(cleanEmail)
      setIsCodeSent(true)
      setSuccess(`인증 코드가 ${cleanEmail}로 전송되었습니다.`)
    } catch (error: any) {
      setError(error.message || "인증 코드 전송에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 이메일 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.")
      return
    }

    if (!sentEmail) {
      setError("먼저 인증 코드를 요청해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await authService.verifyEmailCode(sentEmail, verificationCode)
      setIsEmailVerified(true)
      setSuccess("이메일 인증이 완료되었습니다.")
    } catch (error: any) {
      setError(error.message || "인증 코드 검증에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.")
      return
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      await authService.join(sentEmail, password, nickname.trim(), profileImage || undefined)
      setSuccess("회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.")

      // 2초 후 로그인 화면으로 이동
      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess()
        } else {
          // 폴백: 페이지 이동
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      }, 2000)

      // 폼 초기화
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setNickname("")
      setVerificationCode("")
      setProfileImage(null)
      setIsCodeSent(false)
      setIsEmailVerified(false)
      setSentEmail("")
    } catch (error: any) {
      setError(error.message || "회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 이메일 변경 시 상태 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    if (isCodeSent || isEmailVerified) {
      setIsCodeSent(false)
      setIsEmailVerified(false)
      setSentEmail("")
      setVerificationCode("")
      setSuccess("")
      setError("")
    }
  }

  // 프로필 이미지 선택
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB 이하여야 합니다.")
        return
      }
      setProfileImage(file)
    }
  }

  const handleGoogleSignup = () => {
    const googleAuthUrl = authService.getOAuth2Url("google")
    window.location.href = googleAuthUrl
  }

  const handleKakaoSignup = () => {
    const kakaoAuthUrl = authService.getOAuth2Url("kakao")
    window.location.href = kakaoAuthUrl
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 제곰이를 시작하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 입력 및 인증 코드 전송 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading || isEmailVerified}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading || isEmailVerified || !email}
                variant="outline"
                size="sm"
              >
                {isCodeSent ? "재전송" : "인증"}
              </Button>
            </div>
            {sentEmail && (
              <p className="text-sm text-gray-600">
                코드 전송된 이메일: <strong>{sentEmail}</strong>
              </p>
            )}
          </div>

          {/* 인증 코드 입력 */}
          {isCodeSent && !isEmailVerified && (
            <div className="space-y-2">
              <Label htmlFor="verificationCode">인증 코드</Label>
              <div className="flex gap-2">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="6자리 인증 코드"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isLoading || !verificationCode}
                  variant="outline"
                  size="sm"
                >
                  확인
                </Button>
              </div>
              <p className="text-sm text-gray-500">{sentEmail}로 전송된 6자리 인증 코드를 입력하세요</p>
            </div>
          )}

          {/* 인증 완료 표시 */}
          {isEmailVerified && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ <strong>{sentEmail}</strong> 인증이 완료되었습니다.
              </p>
            </div>
          )}

          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 프로필 이미지 업로드 */}
          <div className="space-y-2">
            <Label htmlFor="profileImage">프로필 이미지 (선택사항)</Label>
            <div className="relative">
              <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            {profileImage && <p className="text-sm text-gray-600">선택된 파일: {profileImage.name}</p>}
          </div>

          {/* 에러 및 성공 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* 회원가입 버튼 */}
          <Button type="submit" className="w-full" disabled={isLoading || !isEmailVerified}>
            {isLoading ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 회원가입
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
            onClick={handleKakaoSignup}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
            </svg>
            카카오로 회원가입
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

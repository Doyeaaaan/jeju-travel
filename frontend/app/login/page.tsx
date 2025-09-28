"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl") || "/"
  const { login } = useAuth()

  // 로그인 상태
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 회원가입 상태
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")
  const [nickname, setNickname] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState("")

  // 비밀번호 찾기 상태
  const [resetEmail, setResetEmail] = useState("")
  const [resetVerificationCode, setResetVerificationCode] = useState("")
  const [isResetEmailVerified, setIsResetEmailVerified] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">("email")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    // 이미 로그인된 경우 리다이렉트
    if (authService.isAuthenticated()) {
      router.push(returnUrl)
    }
  }, [router, returnUrl])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push(returnUrl)
      }
    } catch (error: any) {
      setError(error.message || "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerificationCode = async () => {
    if (!signupEmail) {
      setSignupError("이메일을 입력해주세요.")
      return
    }

    setIsSignupLoading(true)
    setSignupError("")

    try {
      await authService.sendEmailCode(signupEmail)
      setSignupError("")
      alert("인증 코드가 이메일로 전송되었습니다.")
    } catch (error: any) {
      setSignupError(error.message || "인증 코드 전송에 실패했습니다.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setSignupError("인증 코드를 입력해주세요.")
      return
    }

    setIsSignupLoading(true)
    setSignupError("")

    try {
      await authService.verifyEmailCode(signupEmail, verificationCode)
      setIsEmailVerified(true)
      setSignupError("")
      alert("이메일 인증이 완료되었습니다.")
    } catch (error: any) {
      setSignupError(error.message || "인증 코드가 올바르지 않습니다.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailVerified) {
      setSignupError("이메일 인증을 완료해주세요.")
      return
    }

    if (!signupEmail || !signupPassword || !nickname) {
      setSignupError("모든 필드를 입력해주세요.")
      return
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (signupPassword.length < 8) {
      setSignupError("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    setIsSignupLoading(true)
    setSignupError("")

    try {
      await authService.join(signupEmail, signupPassword, nickname)
      
      // 회원가입 성공 시 로그인 탭으로 자동 전환
      setActiveTab("login")
      setEmail(signupEmail)
      setPassword("")

      // 폼 초기화
      setSignupEmail("")
      setSignupPassword("")
      setSignupPasswordConfirm("")
      setNickname("")
      setVerificationCode("")
      setIsEmailVerified(false)
      
      // 성공 메시지 표시
      toast.success("회원가입이 완료되었습니다! 로그인해주세요.")
    } catch (error: any) {
      setSignupError(error.message || "회원가입에 실패했습니다.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  // 이메일 인증 코드 전송
  const handleSendResetVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetEmail) {
      setResetMessage("이메일을 입력해주세요.")
      return
    }

    setIsResetLoading(true)
    setResetMessage("")

    try {
      await authService.sendPasswordResetCode(resetEmail)
      setResetMessage("인증 코드가 이메일로 전송되었습니다.")
      setResetStep("code")
    } catch (error: any) {
      setResetMessage(error.message || "인증 코드 전송에 실패했습니다.")
    } finally {
      setIsResetLoading(false)
    }
  }

  // 인증 코드 확인
  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetVerificationCode) {
      setResetMessage("인증 코드를 입력해주세요.")
      return
    }

    setIsResetLoading(true)
    setResetMessage("")

    try {
      // 기존 이메일 인증 로직 사용 (회원가입과 동일)
      await authService.verifyEmailCode(resetEmail, resetVerificationCode)
      setIsResetEmailVerified(true)
      setResetStep("password")
      setResetMessage("인증이 완료되었습니다. 새 비밀번호를 입력해주세요.")
    } catch (error: any) {
      setResetMessage(error.message || "인증 코드 확인에 실패했습니다.")
    } finally {
      setIsResetLoading(false)
    }
  }

  // 새 비밀번호 설정
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmNewPassword) {
      setResetMessage("비밀번호를 입력해주세요.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setResetMessage("비밀번호가 일치하지 않습니다.")
      return
    }

    if (newPassword.length < 6) {
      setResetMessage("비밀번호는 6자 이상이어야 합니다.")
      return
    }

    setIsResetLoading(true)
    setResetMessage("")

    try {
      // 백엔드 API 호출: 이메일 인증 코드로 비밀번호 변경
      const response = await fetch("/api/api/auth/change-password-by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          verificationCode: resetVerificationCode,
          newPassword: newPassword
        }),
      })

      if (response.ok) {
        setResetMessage("비밀번호가 성공적으로 변경되었습니다!")
        
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          setResetStep("email")
          setResetEmail("")
          setResetVerificationCode("")
          setNewPassword("")
          setConfirmNewPassword("")
          setResetMessage("")
          setIsResetLoading(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        setResetMessage(errorData.message || "비밀번호 변경에 실패했습니다.")
      }
    } catch (error: any) {
      setResetMessage("비밀번호 변경 중 오류가 발생했습니다.")
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleSocialLogin = (provider: "google" | "kakao") => {
    authService.startOAuth2Login(provider)
  }

  const handleSocialSignup = (provider: "google" | "kakao") => {
    authService.startOAuth2Signup(provider)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            홈으로 돌아가기
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">재곰제곰</h2>
          <p className="mt-2 text-sm text-gray-600">제주도 여행 계획의 시작</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">로그인 / 회원가입</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>

              {/* 로그인 탭 */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">비밀번호</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>
                </form>

                <div className="text-center">
                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <button className="text-sm text-orange-600 hover:text-orange-700">비밀번호를 잊으셨나요?</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>비밀번호 찾기</DialogTitle>
                      </DialogHeader>
                      
                      {/* 단계별 UI */}
                      {resetStep === "email" && (
                        <form onSubmit={handleSendResetVerificationCode} className="space-y-4">
                          <div>
                            <Label htmlFor="resetEmail">이메일</Label>
                            <Input
                              id="resetEmail"
                              type="email"
                              placeholder="가입한 이메일을 입력하세요"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>

                          {resetMessage && <div className="text-sm text-center text-gray-600">{resetMessage}</div>}

                          <Button type="submit" className="w-full" disabled={isResetLoading}>
                            {isResetLoading ? "전송 중..." : "인증 코드 전송"}
                          </Button>
                        </form>
                      )}

                      {resetStep === "code" && (
                        <form onSubmit={handleVerifyResetCode} className="space-y-4">
                          <div>
                            <Label htmlFor="resetVerificationCode">인증 코드</Label>
                            <Input
                              id="resetVerificationCode"
                              type="text"
                              placeholder="이메일로 받은 인증 코드를 입력하세요"
                              value={resetVerificationCode}
                              onChange={(e) => setResetVerificationCode(e.target.value)}
                              required
                            />
                          </div>

                          {resetMessage && <div className="text-sm text-center text-gray-600">{resetMessage}</div>}

                          <div className="flex space-x-2">
                            <Button type="submit" className="flex-1" disabled={isResetLoading}>
                              {isResetLoading ? "확인 중..." : "인증 코드 확인"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setResetStep("email")}
                            >
                              뒤로
                            </Button>
                          </div>
                        </form>
                      )}

                      {resetStep === "password" && (
                        <form onSubmit={handleSetNewPassword} className="space-y-4">
                          <div>
                            <Label htmlFor="newPassword">새 비밀번호</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="confirmNewPassword">새 비밀번호 확인</Label>
                            <Input
                              id="confirmNewPassword"
                              type="password"
                              placeholder="새 비밀번호를 다시 입력하세요"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              required
                            />
                          </div>

                          {resetMessage && <div className="text-sm text-center text-gray-600">{resetMessage}</div>}

                          <div className="flex space-x-2">
                            <Button type="submit" className="flex-1" disabled={isResetLoading}>
                              {isResetLoading ? "변경 중..." : "비밀번호 변경"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setResetStep("code")}
                            >
                              뒤로
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                {/* 소셜 로그인 */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSocialLogin("google")}
                  >
                    Google로 로그인
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSocialLogin("kakao")}
                  >
                    카카오로 로그인
                  </Button>
                </div>
              </TabsContent>

              {/* 회원가입 탭 */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signupEmail">이메일</Label>
                    <div className="flex gap-2">
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isEmailVerified}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerificationCode}
                        disabled={isSignupLoading || isEmailVerified}
                      >
                        {isEmailVerified ? "인증완료" : "인증"}
                      </Button>
                    </div>
                  </div>

                  {signupEmail && !isEmailVerified && (
                    <div>
                      <Label htmlFor="verificationCode">인증 코드</Label>
                      <div className="flex gap-2">
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="인증 코드를 입력하세요"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={handleVerifyCode} disabled={isSignupLoading}>
                          확인
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signupPassword">비밀번호</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="비밀번호를 입력하세요 (8자 이상)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signupPasswordConfirm">비밀번호 확인</Label>
                    <Input
                      id="signupPasswordConfirm"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={signupPasswordConfirm}
                      onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>

                  {signupError && <div className="text-red-600 text-sm text-center">{signupError}</div>}

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isSignupLoading || !isEmailVerified}
                  >
                    {isSignupLoading ? "가입 중..." : "회원가입"}
                  </Button>
                </form>

                <div className="text-center">
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">또는</span>
                    </div>
                  </div>
                </div>

                {/* 소셜 회원가입 */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSocialSignup("google")}
                  >
                    Google로 가입하기
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSocialSignup("kakao")}
                  >
                    카카오로 가입하기
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

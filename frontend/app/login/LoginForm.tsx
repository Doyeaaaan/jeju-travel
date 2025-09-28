"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const DEFAULT_PROFILE_IMAGE = "/placeholder.svg?height=100&width=100&text=프로필"

type Props = {
  onFindId: () => void
  onFindPassword: () => void
}

export default function LoginForm({ onFindId, onFindPassword }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      let storedUsers: any[] = []

      try {
        const raw = localStorage.getItem("users") || "[]"
        storedUsers = JSON.parse(raw)
      } catch (err) {
        setErrorMessage("저장된 사용자 정보를 불러오는 데 실패했습니다.")
        setIsLoading(false)
        return
      }

      const matchedUser = storedUsers.find(
        (user) => user.email?.trim().toLowerCase() === email.trim().toLowerCase() && user.password === password,
      )

      if (!matchedUser) {
        setErrorMessage("존재하지 않는 계정이거나 비밀번호가 잘못되었습니다.")
        setIsLoading(false)
        return
      }

      const savedProfileImage = localStorage.getItem(`profileImage-${matchedUser.email}`)
      const updatedUser = {
        ...matchedUser,
        profileImage: savedProfileImage || DEFAULT_PROFILE_IMAGE,
      }

      // 현재 사용자 저장
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // 사용자 이메일 기준으로 프로필 이미지도 저장
      localStorage.setItem(`profileImage-${updatedUser.email}`, updatedUser.profileImage)

      // 사용자별 키 초기화 (존재하지 않을 경우만)
      const baseKeys: { key: string; defaultValue: any }[] = [
        { key: `community-posts-${updatedUser.email}`, defaultValue: [] },
        { key: `liked-posts-${updatedUser.email}`, defaultValue: [] },
        { key: `reviews-${updatedUser.email}`, defaultValue: [] },
        { key: `trips-${updatedUser.email}`, defaultValue: [] },
        { key: `friends-${updatedUser.email}`, defaultValue: [] },
        {
          key: `backgroundImage-${updatedUser.email}`,
          defaultValue: "/placeholder.svg?height=200&width=800&text=배경이미지",
        },
      ]

      baseKeys.forEach(({ key, defaultValue }) => {
        if (localStorage.getItem(key) === null) {
          localStorage.setItem(key, JSON.stringify(defaultValue))
        }
      })

      alert(`${updatedUser.nickname}님 환영합니다!`)
      router.push("/")
    } catch (error) {
      setErrorMessage("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-4 mb-6" onSubmit={handleLogin}>
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="이메일 주소를 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
        />
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm text-gray-600">
            로그인 상태 유지
          </Label>
        </div>
        <div className="flex space-x-3">
          <button type="button" className="text-sm text-gray-600 hover:underline" onClick={onFindId}>
            아이디 찾기
          </button>
          <button type="button" className="text-sm text-gray-600 hover:underline" onClick={onFindPassword}>
            비밀번호 찾기
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  )
}

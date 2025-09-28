"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface SocialSignupFormProps {
  provider: "kakao" | "google"
}

export default function SocialSignupForm({ provider }: SocialSignupFormProps) {
  const [nickname, setNickname] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const providerInfo = {
    kakao: {
      name: "카카오",
      color: "bg-yellow-400",
      email: "user@kakao.com",
    },
    google: {
      name: "구글",
      color: "bg-red-500",
      email: "user@gmail.com",
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!nickname.trim()) {
        alert("닉네임을 입력해주세요.")
        setIsLoading(false)
        return
      }

      if (!birthYear || !birthMonth || !birthDay) {
        alert("생년월일을 모두 입력해주세요.")
        setIsLoading(false)
        return
      }

      const userData = {
        name: `${providerInfo[provider].name} 사용자`,
        email: providerInfo[provider].email,
        nickname: nickname.trim(),
        birthYear,
        birthMonth,
        birthDay,
        provider,
        password: `${provider}_${Date.now()}`, // 소셜 로그인용 임시 비밀번호
      }

      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      existingUsers.push(userData)
      localStorage.setItem("users", JSON.stringify(existingUsers))

      alert(`${providerInfo[provider].name} 계정으로 가입이 완료되었습니다!`)
      window.location.href = "/login"
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center py-6">
      <Image
        src="/placeholder.svg?height=80&width=80&text=제곰이"
        alt="제곰이"
        width={80}
        height={80}
        className="mb-4"
      />

      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 ${providerInfo[provider].color} rounded`}></div>
        <h2 className="text-xl font-bold">{providerInfo[provider].name} 계정으로 가입</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <Label>연동된 이메일</Label>
          <Input type="email" value={providerInfo[provider].email} disabled className="mt-1 bg-gray-100" />
        </div>

        <div>
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="사용할 닉네임을 입력하세요"
            className="mt-1"
          />
        </div>

        <div>
          <Label>생년월일</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="text"
              placeholder="년도"
              maxLength={4}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-1/3"
            />
            <Input
              type="text"
              placeholder="월"
              maxLength={2}
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="w-1/3"
            />
            <Input
              type="text"
              placeholder="일"
              maxLength={2}
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="w-1/3"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
          {isLoading ? "가입 중..." : `${providerInfo[provider].name}로 가입하기`}
        </Button>
      </form>
    </div>
  )
}

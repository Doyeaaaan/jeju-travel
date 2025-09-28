"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

type Props = {
  onSignupComplete: () => void
  checkDuplicate: (field: "email" | "nickname", value: string) => Promise<boolean>
}

export default function SignupForm({ onSignupComplete, checkDuplicate }: Props) {
  const [emailFront, setEmailFront] = useState("")
  const [emailDomain, setEmailDomain] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [nickname, setNickname] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const domainToUse =
        emailDomain === "custom" ? customDomain.trim().toLowerCase() : emailDomain.trim().toLowerCase()
      const fullEmail = `${emailFront.trim().toLowerCase()}@${domainToUse}`

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValid = emailRegex.test(fullEmail)

      if (!isValid) {
        alert("이메일 형식이 올바르지 않습니다.")
        setIsLoading(false)
        return
      }

      if (!emailFront || (!emailDomain && !customDomain)) {
        alert("이메일을 올바르게 입력해주세요.")
        setIsLoading(false)
        return
      }

      if (emailDomain === "custom" && customDomain.trim() === "") {
        alert("도메인을 입력해주세요.")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        alert("비밀번호는 8자리 이상이어야 합니다.")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.")
        setIsLoading(false)
        return
      }

      if (!fullEmail || !password || !nickname) {
        alert("이메일, 비밀번호, 닉네임을 모두 입력해주세요.")
        setIsLoading(false)
        return
      }

      if (!birthYear || !birthMonth || !birthDay) {
        alert("생년월일을 모두 입력해주세요.")
        setIsLoading(false)
        return
      }

      const emailExists = await checkDuplicate("email", fullEmail)
      const nicknameExists = await checkDuplicate("nickname", nickname)

      if (emailExists) {
        alert("이미 사용 중인 이메일입니다.")
        setIsLoading(false)
        return
      }

      if (nicknameExists) {
        alert("이미 사용 중인 닉네임입니다.")
        setIsLoading(false)
        return
      }

      const userData = {
        name: name.trim(),
        email: fullEmail,
        password: password.trim(),
        nickname: nickname.trim(),
        birthYear,
        birthMonth,
        birthDay,
      }

      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      existingUsers.push(userData)
      localStorage.setItem("users", JSON.stringify(existingUsers))

      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.")
      onSignupComplete()
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
        className="mb-8"
      />

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="mt-1"
          />
        </div>

        <div>
          <Label>이메일</Label>
          <div className="flex gap-2 items-center mt-1">
            <Input
              type="text"
              value={emailFront}
              onChange={(e) => setEmailFront(e.target.value)}
              placeholder="example"
              className="flex-1"
            />
            <span>@</span>
            <div className="flex-1">
              {emailDomain === "custom" ? (
                <Input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="도메인 입력"
                />
              ) : (
                <Select value={emailDomain} onValueChange={setEmailDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="도메인 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naver.com">naver.com</SelectItem>
                    <SelectItem value="gmail.com">gmail.com</SelectItem>
                    <SelectItem value="daum.net">daum.net</SelectItem>
                    <SelectItem value="hanmail.net">hanmail.net</SelectItem>
                    <SelectItem value="hotmail.com">hotmail.com</SelectItem>
                    <SelectItem value="nate.com">nate.com</SelectItem>
                    <SelectItem value="yahoo.co.kr">yahoo.co.kr</SelectItem>
                    <SelectItem value="custom">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (e.target.value.length > 0 && e.target.value.length < 8) {
                setPasswordError("비밀번호는 8자리 이상이어야 합니다.")
              } else {
                setPasswordError("")
              }
            }}
            placeholder="비밀번호를 입력하세요 (8자 이상)"
            className={`mt-1 ${passwordError ? "border-red-500" : ""}`}
          />
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (password && e.target.value && password !== e.target.value) {
                setConfirmError("입력하신 비밀번호가 일치하지 않습니다")
              } else {
                setConfirmError("")
              }
            }}
            placeholder="비밀번호를 재입력하세요"
            className={`mt-1 ${confirmError ? "border-red-500" : ""}`}
          />
          {confirmError && <p className="text-sm text-red-500 mt-1">{confirmError}</p>}
        </div>

        <div>
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
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
          {isLoading ? "가입 중..." : "가입하기"}
        </Button>
      </form>
    </div>
  )
}

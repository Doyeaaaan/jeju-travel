"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface IdFinderDialogProps {
  open: boolean
  onClose: () => void
}

  const [name, setName] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [foundEmail, setFoundEmail] = useState("")
  const [step, setStep] = useState<"input" | "result">("input")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!name || !birthYear || !birthMonth || !birthDay) {
        alert("모든 정보를 입력해주세요.")
        setIsLoading(false)
        return
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const matchedUser = users.find(
        (user: any) =>
          user.name === name &&
          user.birthYear === birthYear &&
          user.birthMonth === birthMonth &&
          user.birthDay === birthDay,
      )

      setTimeout(() => {
        if (matchedUser) {
          setFoundEmail(matchedUser.email)
          setStep("result")
        } else {
          alert("일치하는 계정을 찾을 수 없습니다.")
        }
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      alert("오류가 발생했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("input")
    setName("")
    setBirthYear("")
    setBirthMonth("")
    setBirthDay("")
    setFoundEmail("")
    onClose()
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@")
    const maskedLocal = local.length > 2 ? local.substring(0, 2) + "*".repeat(local.length - 2) : local
    return `${maskedLocal}@${domain}`
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>아이디 찾기</DialogTitle>
        </DialogHeader>

        {step === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="find-name">이름</Label>
              <Input
                id="find-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="가입시 입력한 이름"
                className="mt-1"
                required
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
                  required
                />
                <Input
                  type="text"
                  placeholder="월"
                  maxLength={2}
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-1/3"
                  required
                />
                <Input
                  type="text"
                  placeholder="일"
                  maxLength={2}
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-1/3"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? "찾는 중..." : "아이디 찾기"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">아이디를 찾았습니다</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">가입된 이메일:</p>
                <p className="text-lg font-mono">{maskEmail(foundEmail)}</p>
              </div>
              <p className="text-xs text-gray-500">보안을 위해 이메일의 일부가 마스킹되어 표시됩니다.</p>
            </div>
            <Button onClick={handleClose} className="w-full">
              확인
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

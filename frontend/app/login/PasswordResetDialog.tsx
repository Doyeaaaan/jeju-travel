"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordResetDialogProps {
  open: boolean
  onClose: () => void
}

export default function PasswordResetDialog({ open, onClose }: PasswordResetDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"email" | "sent">("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 실제로는 서버에 비밀번호 재설정 이메일 요청
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userExists = users.some((user: any) => user.email === email)

      if (!userExists) {
        alert("등록되지 않은 이메일입니다.")
        setIsLoading(false)
        return
      }

      // 시뮬레이션: 이메일 발송 완료
      setTimeout(() => {
        setStep("sent")
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      alert("오류가 발생했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("email")
    setEmail("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>비밀번호 찾기</DialogTitle>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">이메일 주소</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입시 사용한 이메일을 입력하세요"
                className="mt-1"
                required
              />
            </div>
            <p className="text-sm text-gray-600">입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? "발송 중..." : "재설정 링크 발송"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">이메일을 발송했습니다</h3>
              <p className="text-sm text-gray-600 mb-4">
                <strong>{email}</strong>로<br />
                비밀번호 재설정 링크를 보내드렸습니다.
              </p>
              <p className="text-xs text-gray-500">이메일이 오지 않았다면 스팸함을 확인해주세요.</p>
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

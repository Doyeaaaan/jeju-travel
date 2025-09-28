"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"

export default function DebugPanel() {
  const [testEmail, setTestEmail] = useState("ehdus9893@gmail.com")
  const [testCode, setTestCode] = useState("106600")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testEmailSend = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await authService.sendEmailCode(testEmail)
      setResult(`✅ 이메일 전송 성공:\n${JSON.stringify(response, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ 이메일 전송 실패:\n${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEmailVerify = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await authService.verifyEmailCode(testEmail, testCode)
      setResult(`✅ 이메일 인증 성공:\n${JSON.stringify(response, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ 이메일 인증 실패:\n${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectJoin = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await authService.join(testEmail, "testpassword123", "테스트유저")
      setResult(`✅ 직접 회원가입 성공:\n${JSON.stringify(response, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ 직접 회원가입 실패:\n${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 API 디버그 패널</CardTitle>
        <CardDescription>백엔드 개발자와 협의용 테스트 도구</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">테스트 이메일</Label>
            <Input
              id="test-email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-code">테스트 코드</Label>
            <Input id="test-code" value={testCode} onChange={(e) => setTestCode(e.target.value)} disabled={isLoading} />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={testEmailSend} disabled={isLoading} variant="outline">
            📧 이메일 전송 테스트
          </Button>
          <Button onClick={testEmailVerify} disabled={isLoading} variant="outline">
            🔍 이메일 인증 테스트
          </Button>
          <Button onClick={testDirectJoin} disabled={isLoading} variant="destructive">
            ⚠️ 직접 회원가입 테스트
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <Label>테스트 결과</Label>
            <Textarea value={result} readOnly className="min-h-[200px] font-mono text-sm" />
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>백엔드 개발자 확인 사항:</strong>
            <br />
            1. 서버 로그에서 실제 요청 데이터 확인
            <br />
            2. 데이터베이스에 인증 코드가 저장되는지 확인
            <br />
            3. 인증 코드 만료 시간 설정 확인
            <br />
            4. 이메일 대소문자 처리 방식 확인
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

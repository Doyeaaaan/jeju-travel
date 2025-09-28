"use client"

import { useState } from "react"
import { authService } from "@/lib/auth-service"
import { toast } from "react-hot-toast"

export default function TestApiPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testLogin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await authService.login(email, password)
      setResult(response)
      toast.success("API 호출 성공!")

      // 토큰 저장
      authService.saveTokens(response.data)
    } catch (err: any) {
      setError(err.message || "API 호출 중 오류가 발생했습니다.")
      toast.error("API 호출 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API 연결 테스트</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">로그인 API 테스트</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "로그인 API 테스트"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-semibold">오류 발생</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">API 응답 결과</h3>
          <pre className="bg-white p-4 rounded border overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

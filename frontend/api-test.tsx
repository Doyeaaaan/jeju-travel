"use client"

import { useState } from "react"

export default function ApiTest() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 서버 연결 테스트
      const response = await fetch("http://3.34.42.188:8080/api/post?page=0", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`)
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">API 연결 테스트</h2>

      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "테스트 중..." : "서버 연결 테스트"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <p className="font-medium">오류 발생:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <p className="font-medium mb-2">응답 결과:</p>
          <pre className="p-3 bg-gray-50 border rounded overflow-auto max-h-60 text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}

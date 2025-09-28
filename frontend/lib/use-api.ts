"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseApiOptions {
  immediate?: boolean
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useApi<T>(apiFunction: () => Promise<T | null>, options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastCallRef = useRef<number>(0)

  const refetch = useCallback(async () => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController()
    const currentCall = Date.now()
    lastCallRef.current = currentCall

    try {
      setLoading(true)
      setError(null)

      const result = await apiFunction()

      // 최신 요청인지 확인 (race condition 방지)
      if (currentCall === lastCallRef.current && !abortControllerRef.current.signal.aborted) {
        setData(result)
      }
    } catch (err: any) {
      // 요청이 취소된 경우가 아니라면 에러 설정
      if (currentCall === lastCallRef.current && !abortControllerRef.current.signal.aborted) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (currentCall === lastCallRef.current) {
        setLoading(false)
      }
    }
  }, [apiFunction])

  useEffect(() => {
    if (options.immediate !== false) {
      refetch()
    }

    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch, options.immediate])

  return { data, loading, error, refetch }
}

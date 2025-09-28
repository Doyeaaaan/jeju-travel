import { AuthService } from "./auth-service"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

export interface ApiResponse<T = any> {
  status: string
  message: string
  data?: T
}

export class ApiClient {
  public baseURL: string  // private에서 public으로 변경
  private maxRetries = 2 // 재시도 횟수 증가

  constructor(baseURL = "/api") {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true,
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    log(`🌐 API 요청: ${options.method || "GET"} ${url} (재시도: ${retryCount})`)
    log(`🔑 Authorization: ${headers.Authorization ? "Bearer ***" : "없음"}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      log(`📡 응답 상태: ${response.status}`)

      // 401/403 응답 처리
      if (response.status === 401) {

        // 재시도 횟수 초과 체크
        if (retryCount >= this.maxRetries) {
          const authService = new AuthService()
          authService.clearTokens()
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
        }

        // 토큰 갱신 시도
        try {
          log("🔄 토큰 갱신 시도...")
          const authService = new AuthService()
          const newTokens = await authService.reissueToken()

          if (newTokens) {
            log("✅ 토큰 갱신 성공, 요청 재시도")
            // 새로운 토큰으로 헤더 업데이트
            headers.Authorization = `Bearer ${newTokens.accessToken}`
            // 재귀적으로 원래 요청 재시도 (재시도 횟수 증가)
            return this.request(endpoint, { ...options, headers }, requireAuth, retryCount + 1)
          }
        } catch (refreshError) {
          const authService = new AuthService()
          authService.clearTokens()

          // 토큰 갱신 실패 시에만 로그인 페이지로 리다이렉트
          if (typeof window !== "undefined" && retryCount >= this.maxRetries) {
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.href = `/login?returnUrl=${returnUrl}`
          }
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
        }
      } else if (response.status === 403) {
        // 403은 권한 부족이므로 토큰 재발급을 시도하지 않음
        throw new Error("권한이 없습니다. 해당 작업을 수행할 수 없습니다.")
      }

      // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽음
      const text = await response.text()
      let data

      try {
        data = text ? JSON.parse(text) : {}
      } catch (e) {
        data = { message: text }
      }

      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`) as any
        error.status = response.status
        error.response = {
          status: response.status,
          data: data,
        }
        throw error
      }

      log("📦 응답 데이터:", data)
      return data
    } catch (error) {
      throw error
    }
  }

  async get<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, requireAuth)
  }

  async post<T>(endpoint: string, data: any, requireAuth = true): Promise<ApiResponse<T>> {
    // 문자열인 경우 JSON.stringify를 하지 않음
    const body = typeof data === 'string' ? data : JSON.stringify(data)
    
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: body,
      },
      requireAuth,
    )
  }

  async postFormData<T>(endpoint: string, formData: FormData, requireAuth = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {}

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    log(`🌐 API 요청 (FormData): POST ${url}`)
    log(`🔑 Authorization: ${headers.Authorization ? "Bearer ***" : "없음"}`)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      log(`📡 응답 상태: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      log("📦 응답 데이터:", data)

      return data
    } catch (error) {
      throw error
    }
  }

  async put<T>(endpoint: string, data: any, requireAuth = true): Promise<ApiResponse<T>> {
    // 문자열인 경우 JSON.stringify를 하지 않음
    const body = typeof data === 'string' ? data : JSON.stringify(data)
    
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: body,
      },
      requireAuth,
    )
  }

  async putFormData<T>(endpoint: string, formData: FormData, requireAuth = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {}

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    log(`🌐 API 요청 (FormData): PUT ${url}`)
    log(`🔑 Authorization: ${headers.Authorization ? "Bearer ***" : "없음"}`)

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: formData,
      })

      log(`📡 응답 상태: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      log("📦 응답 데이터:", data)

      return data
    } catch (error) {
      throw error
    }
  }

  async patchFormData<T>(endpoint: string, formData: FormData, requireAuth = true): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {}

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    log(`🌐 API 요청 (FormData): PATCH ${url}`)
    log(`🔑 Authorization: ${headers.Authorization ? "Bearer ***" : "없음"}`)

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: formData,
      })

      log(`📡 응답 상태: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      log("📦 응답 데이터:", data)

      return data
    } catch (error) {
      throw error
    }
  }

  async delete<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, requireAuth)
  }

  async getVisitJeju<T>(endpoint: string): Promise<T> {
    const url = `/api${endpoint}`
    
    log(`🌐 VisitJeju API 요청: GET ${url}`)
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      log(`📡 VisitJeju 응답 상태: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      log("📦 VisitJeju 응답 데이터:", data)
      
      return data
    } catch (error) {
      throw error
    }
  }
}

export const apiClient = new ApiClient()

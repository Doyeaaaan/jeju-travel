import { apiClient } from "./api-client"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

import type {
  LoginRequestDto,
  LoginResponseDto,
  JoinRequestDto,
  OAuth2JoinRequestDto,
  VerifyCodeDto,
  ReissueRequestDto,
  EmailDto,
  User,
} from "../types/api-types"

export class AuthService {
  private readonly ACCESS_TOKEN_KEY = "accessToken"
  private readonly REFRESH_TOKEN_KEY = "refreshToken"
  private readonly USER_KEY = "user"
  private tokenCheckInterval: NodeJS.Timeout | null = null
  private readonly REFRESH_THRESHOLD = 15 * 60 * 1000 // 15분(밀리초)

  constructor() {
    if (typeof window !== "undefined") {
      // 클래스 인스턴스 생성 시 토큰 체크 시작
      this.startTokenCheck()
    }
  }

  // 토큰 체크 시작
  private startTokenCheck() {
    // 이미 실행 중인 인터벌이 있다면 중지
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval)
    }

    // 1분마다 토큰 상태 체크
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndRefreshToken()
    }, 60 * 1000)

    // 초기 체크 실행
    this.checkAndRefreshToken()
  }

  // 토큰 체크 중지
  private stopTokenCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval)
      this.tokenCheckInterval = null
    }
  }

  // 토큰 상태 체크 및 필요시 갱신
  private async checkAndRefreshToken() {
    try {
      const accessTokenExpiration = localStorage.getItem("accessTokenExpiration")
      if (!accessTokenExpiration) return

      const expirationTime = Number(accessTokenExpiration)
      const currentTime = Date.now()
      const timeUntilExpiration = expirationTime - currentTime

      // 만료 15분 전에 토큰 갱신
      if (timeUntilExpiration > 0 && timeUntilExpiration <= this.REFRESH_THRESHOLD) {
        log("🔄 토큰 만료 15분 전, 자동 갱신 시도")
        await this.reissueToken()
      }
    } catch (error) {
    }
  }

  // 토큰 저장
  saveTokens(loginResponse: LoginResponseDto): void {
    log("💾 토큰 저장 중...", {
      accessToken: loginResponse.accessToken ? `${loginResponse.accessToken.substring(0, 20)}...` : null,
      refreshToken: loginResponse.refreshToken ? `${loginResponse.refreshToken.substring(0, 20)}...` : null,
      accessTokenExpirationTime: loginResponse.accessTokenExpirationTime,
      refreshTokenExpirationTime: loginResponse.refreshTokenExpirationTime
    })

    localStorage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken)

    // 만료 시간도 저장
    const accessTokenExpiration = Date.now() + loginResponse.accessTokenExpirationTime
    const refreshTokenExpiration = Date.now() + loginResponse.refreshTokenExpirationTime
    localStorage.setItem("accessTokenExpiration", accessTokenExpiration.toString())
    localStorage.setItem("refreshTokenExpiration", refreshTokenExpiration.toString())

    log("✅ 토큰 저장 완료", {
      accessTokenExpiration: new Date(accessTokenExpiration).toLocaleString(),
      refreshTokenExpiration: new Date(refreshTokenExpiration).toLocaleString()
    })

    // 토큰이 저장되면 체크 시작
    this.startTokenCheck()
  }

  // Access Token 가져오기
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // Refresh Token 가져오기
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // 사용자 정보 저장
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  // 사용자 정보 가져오기
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  // JWT 토큰 디코딩
  decodeToken(token: string): any {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      return null
    }
  }

  // 토큰 유효성 검사
  isTokenValid(): boolean {
    const token = this.getAccessToken()
    if (!token) {
      log("❌ 토큰 유효성 검사 실패: 토큰 없음")
      return false
    }

    const expiration = localStorage.getItem("accessTokenExpiration")
    if (!expiration) {
      log("❌ 토큰 유효성 검사 실패: 만료 시간 없음")
      return false
    }

    const currentTime = Date.now()
    const expirationTime = Number.parseInt(expiration)
    const isValid = currentTime < expirationTime
    
    log("⏰ 토큰 유효성 검사:", {
      currentTime: new Date(currentTime).toLocaleString(),
      expirationTime: new Date(expirationTime).toLocaleString(),
      isValid,
      timeRemaining: expirationTime - currentTime
    })
    
    return isValid
  }

  // 인증 상태 확인
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    const isValid = this.isTokenValid()
    
    log("🔐 인증 상태 확인:", {
      hasAccessToken: !!accessToken,
      isTokenValid: isValid,
      result: !!accessToken && isValid
    })
    
    return !!accessToken && isValid
  }

  // 토큰 정리 (clearTokens 메서드 수정)
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem("accessTokenExpiration")
    localStorage.removeItem("refreshTokenExpiration")
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userNickname")

    // 토큰이 제거되면 체크 중지
    this.stopTokenCheck()
  }

  // 로그아웃
  logout(): void {
    this.clearTokens()
  }

  // 이메일 중복 확인 및 인증 코드 전송
  async sendEmailCode(email: string): Promise<void> {
    const response = await apiClient.post<any>("/api/auth/send-email", email, false)

    // 백엔드에서 성공 응답이 "200 OK" 또는 "SUCCESS"로 올 수 있음
    if (response.status !== "SUCCESS" && !response.status.includes("200")) {
      throw new Error(response.message || "인증 코드 전송에 실패했습니다.")
    }
  }

  // 비밀번호 찾기용 이메일 인증 코드 발송
  async sendPasswordResetCode(email: string): Promise<void> {
    const response = await apiClient.post<any>("/api/auth/send-password-reset-code", email, false)

    // 백엔드에서 성공 응답이 "200 OK" 또는 "SUCCESS"로 올 수 있음
    if (response.status !== "SUCCESS" && !response.status.includes("200")) {
      throw new Error(response.message || "비밀번호 찾기 인증 코드 전송에 실패했습니다.")
    }
  }

  // 이메일 인증 코드 검증
  async verifyEmailCode(email: string, code: string): Promise<void> {
    const verifyDto: VerifyCodeDto = { email, code }
    log("📧 인증 코드 검증 요청:", verifyDto)
    const response = await apiClient.post<any>("/api/auth/verify-email", verifyDto, false)

    // 백엔드에서 성공 응답이 "200 OK" 또는 "SUCCESS"로 올 수 있음
    if (response.status !== "SUCCESS" && !response.status.includes("200")) {
      throw new Error(response.message || "인증 코드 검증에 실패했습니다.")
    }
  }

  // 일반 회원가입
  async join(email: string, password: string, nickname: string, image?: File): Promise<void> {
    const formData = new FormData()

    const joinData: JoinRequestDto = { email, password, nickname }
    formData.append("data", JSON.stringify(joinData))

    if (image) {
      formData.append("image", image)
    }

    const response = await apiClient.postFormData<any>("/api/auth/join", formData, false)

    if (response.status !== "SUCCESS" && response.status !== "200 OK") {
      throw new Error(response.message || "회원가입에 실패했습니다.")
    }
  }

  // 일반 로그인
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const loginRequest: LoginRequestDto = { email, password }
    const response = await apiClient.post<LoginResponseDto>("/api/auth/login", loginRequest, false)

    log("🔍 로그인 응답 분석:", response)

    // 백엔드에서 성공 응답이 "SUCCESS" 또는 성공 메시지와 함께 올 수 있음
    if (response.data) {
      log("✅ 로그인 성공, 토큰 저장 중...")
      this.saveTokens(response.data)

      // 토큰에서 사용자 정보 추출
      const decoded = this.decodeToken(response.data.accessToken)
      if (decoded) {
        const user: User = {
          id: Number.parseInt(decoded.sub),
          email: decoded.email || email,
          nickname: decoded.nickname || email.split("@")[0],
          profileImage: decoded.profileImage,
          role: decoded.role || "ROLE_USER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.saveUser(user)
        log("👤 사용자 정보 저장 완료:", user)
      }
      return response.data
    } else {
      throw new Error(response.message || "로그인에 실패했습니다.")
    }
  }

  // OAuth2 로그인
  async oauth2Login(provider: string, code: string): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>(`/api/auth/login/${provider}`, code, false)

    if (response.data) {
      this.saveTokens(response.data)

      const decoded = this.decodeToken(response.data.accessToken)
      if (decoded) {
        const user: User = {
          id: Number.parseInt(decoded.sub),
          email: decoded.email,
          nickname: decoded.nickname,
          profileImage: decoded.profileImage,
          role: decoded.role || "ROLE_USER",
          provider: provider.toUpperCase() as "GOOGLE" | "KAKAO",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.saveUser(user)
      }
      return response.data
    } else {
      throw new Error(response.message || "OAuth2 로그인에 실패했습니다.")
    }
  }

  // OAuth2 회원가입
  async oauth2Signup(
    provider: string,
    email: string,
    nickname: string,
    code: string,
    image?: File,
  ): Promise<LoginResponseDto> {
    const formData = new FormData()

    const joinData: OAuth2JoinRequestDto = { email, nickname, code }
    formData.append("data", JSON.stringify(joinData))

    if (image) {
      formData.append("image", image)
    }

    const response = await apiClient.postFormData<LoginResponseDto>(`/api/auth/join/${provider}`, formData, false)

    if (response.data) {
      this.saveTokens(response.data)

      const decoded = this.decodeToken(response.data.accessToken)
      if (decoded) {
        const user: User = {
          id: Number.parseInt(decoded.sub),
          email: decoded.email,
          nickname: decoded.nickname,
          profileImage: decoded.profileImage,
          role: decoded.role || "ROLE_USER",
          provider: provider.toUpperCase() as "GOOGLE" | "KAKAO",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.saveUser(user)
      }
      return response.data
    } else {
      throw new Error(response.message || "OAuth2 회원가입에 실패했습니다.")
    }
  }

  // 임시 비밀번호 발급
  async resetPassword(email: string): Promise<void> {
    const response = await apiClient.post<any>("/api/auth/reset-password", email, false)

    if (response.status !== "SUCCESS") {
      throw new Error(response.message || "임시 비밀번호 발급에 실패했습니다.")
    }
  }

  // 토큰 재발급
  async reissueToken(): Promise<LoginResponseDto> {
    const refreshToken = this.getRefreshToken()
    const accessToken = this.getAccessToken()
    log("🔑 현재 토큰 상태:", {
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken,
      refreshTokenExpiration: localStorage.getItem("refreshTokenExpiration"),
      accessTokenExpiration: localStorage.getItem("accessTokenExpiration"),
    })

    if (!refreshToken) {
      throw new Error("Refresh token not found")
    }

    // 리프레시 토큰 만료 체크 (여유 시간 5분 추가)
    const refreshTokenExpiration = localStorage.getItem("refreshTokenExpiration")
    if (refreshTokenExpiration) {
      const expirationTime = Number(refreshTokenExpiration)
      const currentTime = Date.now()
      const bufferTime = 5 * 60 * 1000 // 5분 버퍼
      
      if (currentTime > expirationTime - bufferTime) {
        
        // 만료된 토큰 정리
        this.clearTokens()
        throw new Error("Refresh token has expired")
      }
    }

    const reissueRequest: ReissueRequestDto = { refreshToken }

    try {
      log("🔄 토큰 재발급 시도")
      log("📤 요청 데이터:", { refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null })
      
      const response = await fetch("/api/api/auth/reissue-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reissueRequest),
      })

      const text = await response.text()
      let data

      // HTML 응답 체크
      if (text.trim().startsWith("<!DOCTYPE html>") || text.trim().startsWith("<html>")) {
        throw new Error("Token reissue failed")
      }

      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error("Invalid token reissue response")
      }

      if (!response.ok) {
        
        // 401 오류 시 Refresh Token을 삭제하고 로그아웃 처리
        if (response.status === 401) {
          this.clearTokens()
          // 로그아웃 이벤트 발생
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:logout"))
          }
        }
        
        throw new Error(data.message || `Token reissue failed: ${response.status}`)
      }

      if (data.data) {
        log("✅ 토큰 재발급 성공")
        this.saveTokens(data.data)
        return data.data
      } else {
        throw new Error("Invalid token reissue response")
      }
    } catch (error) {
      throw error
    }
  }

  // OAuth2 URL 생성
  getOAuth2Url(provider: "google" | "kakao"): string {
    const baseUrl = "/api"

    if (provider === "google") {
      return `${baseUrl}/oauth2/authorization/google`
    } else if (provider === "kakao") {
      return `${baseUrl}/oauth2/authorization/kakao`
    }

    return ""
  }

  // OAuth2 회원가입 URL 생성
  getOAuth2SignupUrl(provider: "google" | "kakao"): string {
    const baseUrl = "/api"

    if (provider === "google") {
      return `${baseUrl}/oauth2/authorization/google?signup=true`
    } else if (provider === "kakao") {
      return `${baseUrl}/oauth2/authorization/kakao?signup=true`
    }

    return ""
  }

  // OAuth2 로그인 시작

  // 현재 사용자 정보 조회 (서버에서 토큰 유효성 확인)
  async getCurrentUserFromServer(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/api/auth/me", true)
      if (response.data) {
        log("✅ 서버에서 사용자 정보 조회 성공:", response.data)
        return response.data
      }
      return null
    } catch (error: any) {
      return null
    }
  }
  startOAuth2Login(provider: "google" | "kakao"): void {
    const url = this.getOAuth2Url(provider)
    window.location.href = url
  }

  // OAuth2 회원가입 시작
  startOAuth2Signup(provider: "google" | "kakao"): void {
    const url = this.getOAuth2SignupUrl(provider)
    window.location.href = url
  }
}

export const authService = new AuthService()

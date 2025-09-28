"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { authService } from "../lib/auth-service"
import type { User } from "../types/api-types"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  oauth2Login: (provider: string, code: string) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  // StrictMode 이슈 해결을 위한 ref
  const initializationRef = useRef(false)
  const initializationPromiseRef = useRef<Promise<void> | null>(null)

  // 토큰 갱신
  const refreshToken = async (): Promise<boolean> => {
    log("🔄 토큰 갱신 시도 중...")
    try {
      const refreshTokenValue = authService.getRefreshToken()
      const refreshTokenExpiration = localStorage.getItem("refreshTokenExpiration")

      if (!refreshTokenValue) {
        log("❌ 리프레시 토큰이 없음")
        return false
      }

      // 리프레시 토큰 만료 확인
      if (refreshTokenExpiration) {
        const currentTime = Date.now()
        const expirationTime = Number.parseInt(refreshTokenExpiration)
        if (currentTime >= expirationTime) {
          log("❌ 리프레시 토큰도 만료됨")
          authService.clearTokens()
          setUser(null)
          setIsAuthenticated(false)
          return false
        }
      }

      const response = await authService.reissueToken()
      if (response && response.accessToken) {
        log("✅ 토큰 갱신 성공")

        // JWT에서 사용자 정보 추출
        const payload = authService.decodeToken(response.accessToken)
        if (payload && payload.sub) {
          const userData: User = {
            id: Number.parseInt(payload.sub),
            email: user?.email || payload.email || "unknown@example.com",
            nickname: user?.nickname || payload.nickname || "사용자",
            profileImage: payload.profileImage,
            role: payload.role || "ROLE_USER",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          // 닉네임이 없으면 이메일 기반으로 생성
          if (!userData.nickname || userData.nickname === "사용자") {
            if (userData.email && userData.email !== "unknown@example.com") {
              userData.nickname = userData.email.split("@")[0];
              log("🔧 토큰 갱신 시 닉네임 생성:", userData.nickname);
            }
          }
          
          setUser(userData)
          setIsAuthenticated(true)
          log("👤 토큰 갱신 후 사용자 정보:", userData)
        }

        return true
      }
      return false
    } catch (error: any) {

      // 토큰 만료 관련 에러인 경우에만 토큰 정리
      if (
        error.message.includes("Expired") ||
        error.message.includes("expired") ||
        error.message.includes("Invalid") ||
        error.message.includes("invalid") ||
        error.message.includes("리프레시 토큰이 일치하지 않습니다") ||
        error.message.includes("Refresh token not found") ||
        error.message.includes("Refresh token has expired")
      ) {
        log("🧹 만료된 토큰 정리 중...")
        authService.clearTokens()
        setUser(null)
        setIsAuthenticated(false)
      }
      return false
    }
  }

  // 일반 로그인
  const login = async (email: string, password: string): Promise<boolean> => {
    log("🔑 로그인 시도 중...")
    try {
      const response = await authService.login(email, password)
      log("📦 로그인 응답:", response)

      if (response) {
        log("✅ 로그인 성공")

        // JWT에서 사용자 정보 추출
        const payload = authService.decodeToken(response.accessToken)
        log("🔍 JWT 페이로드:", payload)

        if (payload && payload.sub) {
          const userData: User = {
            id: Number.parseInt(payload.sub),
            email: email,
            nickname: payload.nickname || email.split("@")[0],
            profileImage: payload.profileImage,
            role: payload.role || "ROLE_USER",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          // 닉네임이 없으면 이메일 기반으로 생성
          if (!userData.nickname && userData.email) {
            userData.nickname = userData.email.split("@")[0];
            log("🔧 로그인 시 닉네임 생성:", userData.nickname);
          }
          
          setUser(userData)
          setIsAuthenticated(true)
          log("👤 사용자 정보 저장 완료:", userData)

          return true
        } else {
          return false
        }
      }
      return false
    } catch (error: any) {
      throw error
    }
  }

  // OAuth2 로그인
  const oauth2Login = async (provider: string, code: string): Promise<boolean> => {
    log("🔑 OAuth2 로그인 시도 중:", { provider })
    try {
      const response = await authService.oauth2Login(provider, code)
      log("📦 OAuth2 로그인 응답:", response)

      if (response) {
        log("✅ OAuth2 로그인 성공")

        // JWT에서 사용자 정보 추출
        const payload = authService.decodeToken(response.accessToken)
        log("🔍 JWT 페이로드:", payload)

        if (payload && payload.sub) {
          const userData: User = {
            id: Number.parseInt(payload.sub),
            email: payload.email || "unknown@example.com",
            nickname: payload.nickname || "사용자",
            profileImage: payload.profileImage,
            role: payload.role || "ROLE_USER",
            provider: provider.toUpperCase() as "GOOGLE" | "KAKAO",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          // 닉네임이 없으면 이메일 기반으로 생성
          if (!userData.nickname || userData.nickname === "사용자") {
            if (userData.email && userData.email !== "unknown@example.com") {
              userData.nickname = userData.email.split("@")[0];
              log("🔧 OAuth2 로그인 시 닉네임 생성:", userData.nickname);
            }
          }
          
          setUser(userData)
          setIsAuthenticated(true)
          log("👤 OAuth2 사용자 정보 저장 완료:", userData)

          return true
        } else {
          return false
        }
      }
      return false
    } catch (error: any) {
      return false
    }
  }

  // 로그아웃
  const logout = () => {
    log("🚪 로그아웃 중...")
    authService.clearTokens()
    setUser(null)
    setIsAuthenticated(false)
    log("✅ 로그아웃 완료")
  }

  // 사용자 정보 업데이트
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      authService.saveUser(updatedUser)
      log("👤 사용자 정보 업데이트됨:", updatedUser)
    }
  }

  // 인증 상태 초기화
  useEffect(() => {
    // StrictMode 이슈 해결: 이미 초기화 중이면 기존 Promise를 반환
    if (initializationRef.current) {
      if (initializationPromiseRef.current) {
        initializationPromiseRef.current.then(() => {
          log("🔍 이미 진행 중인 초기화 완료 대기")
        })
      }
      return
    }

    initializationRef.current = true

    const initializeAuth = async (): Promise<void> => {
      log("🔍 인증 상태 초기화 시작...")
      setAuthLoading(true)

      try {
        const token = authService.getAccessToken()
        const refreshTokenValue = authService.getRefreshToken()
        
        log("🔍 토큰 상태 확인:", {
          hasAccessToken: !!token,
          hasRefreshToken: !!refreshTokenValue,
          accessTokenExpiration: localStorage.getItem("accessTokenExpiration"),
          refreshTokenExpiration: localStorage.getItem("refreshTokenExpiration")
        })

        if (!token || !refreshTokenValue) {
          log("❌ 저장된 토큰이 없음 - 로그아웃 상태")
          setUser(null)
          setIsAuthenticated(false)
          setAuthLoading(false)
          return
        }

        // 토큰이 있으면 일단 사용자 정보 복원 시도
        try {
          log("🔍 토큰 디코딩 시도...")
          const payload = authService.decodeToken(token)
          log("🔍 디코딩된 페이로드:", payload)
          
          if (payload && payload.sub) {
            const savedUser = authService.getCurrentUser()
            log("🔍 저장된 사용자 정보:", savedUser)

            const userData: User = {
              id: Number.parseInt(payload.sub),
              email: savedUser?.email || payload.email || "unknown@example.com",
              nickname: savedUser?.nickname || payload.nickname || "사용자",
              profileImage: payload.profileImage,
              role: payload.role || "ROLE_USER",
              provider: savedUser?.provider,
              createdAt: savedUser?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            // 닉네임이 없으면 이메일 기반으로 생성
            if (!userData.nickname || userData.nickname === "사용자") {
              if (userData.email && userData.email !== "unknown@example.com") {
                userData.nickname = userData.email.split("@")[0];
                log("🔧 초기화 시 닉네임 생성:", userData.nickname);
              }
            }

            log("👤 토큰에서 사용자 정보 복원 성공:", userData)
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            throw new Error("Invalid token payload")
          }
        } catch (error) {
          // 토큰 디코딩 실패 시 토큰 정리
          authService.clearTokens()
          setUser(null)
          setIsAuthenticated(false)
          setAuthLoading(false)
          return
        }

        // 토큰 유효성 검사
        log("�� 토큰 유효성 검사 중...")
        if (!authService.isTokenValid()) {
          log("⚠️ 액세스 토큰이 만료됨, 갱신 시도...")

          // 리프레시 토큰도 만료되었는지 확인
          const refreshTokenExpiration = localStorage.getItem("refreshTokenExpiration")
          if (refreshTokenExpiration) {
            const currentTime = Date.now()
            const expirationTime = Number.parseInt(refreshTokenExpiration)
            log("🔍 리프레시 토큰 만료 시간 확인:", {
              currentTime,
              expirationTime,
              isExpired: currentTime >= expirationTime
            })
            
            if (currentTime >= expirationTime) {
              log("❌ 리프레시 토큰도 만료됨, 로그아웃 처리")
              authService.clearTokens()
              setUser(null)
              setIsAuthenticated(false)
              setAuthLoading(false)
              return
            }
          }

          // 토큰 갱신 시도
          log("🔄 토큰 갱신 시도...")
          const refreshSuccess = await refreshToken()
          if (!refreshSuccess) {
            log("❌ 토큰 갱신 실패, 로그아웃 처리")
            authService.clearTokens()
            setUser(null)
            setIsAuthenticated(false)
            setAuthLoading(false)
            return
          }
        } else {
          log("✅ 유효한 토큰 확인됨")
        }

        // 서버에서 사용자 정보 확인 (토큰 유효성 검증)
        log("🔍 서버에서 사용자 정보 확인 중...")
        const serverUser = await authService.getCurrentUserFromServer()
        if (!serverUser) {
          log("❌ 서버에서 사용자 정보 조회 실패 - 토큰이 유효하지 않음")
          authService.clearTokens()
          setUser(null)
          setIsAuthenticated(false)
          setAuthLoading(false)
          return
        }
        
        // 서버에서 가져온 사용자 정보로 닉네임이 없으면 이메일 기반으로 생성
        if (!serverUser.nickname && serverUser.email) {
          serverUser.nickname = serverUser.email.split("@")[0];
          log("🔧 닉네임이 없어서 이메일 기반으로 생성:", serverUser.nickname);
        }
        
        log("✅ 서버에서 사용자 정보 확인 성공:", serverUser)
        setUser(serverUser)
        setIsAuthenticated(true)
      } catch (error) {
        authService.clearTokens()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        log("🔍 인증 초기화 완료 - authLoading을 false로 설정")
        setAuthLoading(false)
      }
    }

    // Promise를 ref에 저장하여 중복 실행 방지
    initializationPromiseRef.current = initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        login,
        oauth2Login,
        logout,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

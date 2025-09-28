// 디버깅을 위한 서비스
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
export class DebugService {
  // 이메일 인증 코드 임시 저장소 (실제 환경에서는 사용하지 말 것)
  private static emailCodes: Map<string, { code: string; timestamp: number }> = new Map()

  // 테스트용 이메일 인증 코드 생성
  static generateTestCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    this.emailCodes.set(email, {
      code,
      timestamp: Date.now(),
    })
    log(`🧪 테스트 코드 생성: ${email} -> ${code}`)
    return code
  }

  // 테스트용 이메일 인증 코드 검증
  static verifyTestCode(email: string, inputCode: string): boolean {
    const stored = this.emailCodes.get(email)
    if (!stored) {
      log(`❌ 저장된 코드 없음: ${email}`)
      return false
    }

    // 5분 만료
    if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
      log(`⏰ 코드 만료: ${email}`)
      this.emailCodes.delete(email)
      return false
    }

    const isValid = stored.code === inputCode
    log(`🔍 코드 검증: ${email}, 입력: ${inputCode}, 저장: ${stored.code}, 결과: ${isValid}`)

    if (isValid) {
      this.emailCodes.delete(email)
    }

    return isValid
  }

  // 서버 응답 분석
  static analyzeServerResponse(response: any, context: string) {
    log(`📊 서버 응답 분석 [${context}]:`, {
      status: response.status,
      message: response.message,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  }

  // 네트워크 요청 로깅
  static logNetworkRequest(method: string, url: string, data: any) {
    log(`🌐 네트워크 요청 [${method}]:`, {
      url,
      data,
      timestamp: new Date().toISOString(),
    })
  }
}

// Export both the class and a convenience instance
export const debugService = DebugService

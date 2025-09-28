declare global {
// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화
  interface Window {
    kakao: any
  }
}

export interface MarkerData {
  id: string
  position: {
    lat: number
    lng: number
  }
  title: string
  content?: string
}

export interface KakaoMapOptions {
  center?: {
    lat: number
    lng: number
  }
  level?: number
}

class KakaoMapService {
  private readonly KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "YOUR_VALID_KAKAO_API_KEY" // JavaScript API 키
  private isScriptLoaded = false

  // 카카오맵 API 스크립트 로드
  async loadKakaoMapAPI(): Promise<void> {
    log("🔑 카카오맵 API 키:", this.KAKAO_MAP_API_KEY)
    
    if (this.isScriptLoaded) {
      log("✅ 카카오맵 API 이미 로드됨")
      return
    }

    log("📡 카카오맵 API 스크립트 로딩 시작...")
    
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${this.KAKAO_MAP_API_KEY}&autoload=false`
      
      log("🌐 카카오맵 스크립트 URL:", script.src)
      
      script.onload = () => {
        log("📥 카카오맵 스크립트 로드 완료, 맵 초기화 중...")
        window.kakao.maps.load(() => {
          log("✅ 카카오맵 API 초기화 완료")
          this.isScriptLoaded = true
          resolve()
        })
      }
      script.onerror = (e) => {
        this.isScriptLoaded = false
        reject(new Error("카카오맵 API 로드 실패 - API 키를 확인해주세요"))
      }
      document.head.appendChild(script)
    })
  }

  // 지도 생성
  createMap(container: HTMLElement, options: KakaoMapOptions = {}): any {
    const defaultOptions = {
      center: new window.kakao.maps.LatLng(33.3617, 126.5292), // 제주도 중심
      level: 3,
    }

    if (options.center) {
      defaultOptions.center = new window.kakao.maps.LatLng(options.center.lat, options.center.lng)
    }

    if (options.level) {
      defaultOptions.level = options.level
    }

    return new window.kakao.maps.Map(container, defaultOptions)
  }

  // 마커 생성
  createMarker(map: any, markerData: MarkerData): any {
    const position = new window.kakao.maps.LatLng(markerData.position.lat, markerData.position.lng)
    const marker = new window.kakao.maps.Marker({ position })
    marker.setMap(map)

    if (markerData.content) {
      const infowindow = new window.kakao.maps.InfoWindow({
        content: markerData.content,
      })

      window.kakao.maps.event.addListener(marker, "click", () => {
        infowindow.open(map, marker)
      })
    }

    return marker
  }

  // 지도 범위 설정
  setBounds(map: any, markers: MarkerData[]): void {
    const bounds = new window.kakao.maps.LatLngBounds()
    markers.forEach((marker) => {
      bounds.extend(new window.kakao.maps.LatLng(marker.position.lat, marker.position.lng))
    })
    map.setBounds(bounds)
  }
}

export const kakaoMapService = new KakaoMapService()

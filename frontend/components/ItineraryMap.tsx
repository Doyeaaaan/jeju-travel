"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

interface Place {
  name: string
  category: string
  lat?: number
  lng?: number
  placeId?: string
}

interface ItineraryMapProps {
  itinerary: {
    title: string
    days: Array<{
      day: number
      items: Array<{
        label: string
        category: string
        placeId?: string
        slot: string
      }>
    }>
  }
  activeDay?: number // 선택된 일차 (선택사항)
  showAllDays?: boolean // 모든 일차 표시 여부 (기본값: true)
}

// 제주도 장소 좌표 매핑 (DB에 따로 넣어뒀음. 일단은 하드코딩)
const PLACE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // 관광지
  "성산일출봉": { lat: 33.458, lng: 126.942 },
  "만장굴": { lat: 33.528, lng: 126.772 },
  "천지연폭포": { lat: 33.247, lng: 126.559 },
  "한라산": { lat: 33.361, lng: 126.529 },
  "협재해수욕장": { lat: 33.393, lng: 126.239 },
  "우도": { lat: 33.506, lng: 126.953 },
  "중문관광단지": { lat: 33.239, lng: 126.414 },
  "제주올레길": { lat: 33.499, lng: 126.531 },
  "테디베어뮤지엄": { lat: 33.239, lng: 126.414 },
  "제주민속촌": { lat: 33.305, lng: 126.289 },
  
  // 맛집
  "제주 흑돼지 맛집": { lat: 33.499, lng: 126.531 },
  "해녀의 집": { lat: 33.458, lng: 126.942 },
  "한라산 정상 카페": { lat: 33.361, lng: 126.529 },
  "제주 해산물 맛집": { lat: 33.393, lng: 126.239 },
  "갈치조림 맛집": { lat: 33.239, lng: 126.414 },
  "옥돔구이 전문점": { lat: 33.305, lng: 126.289 },
  "전복죽 맛집": { lat: 33.528, lng: 126.772 },
  "고기국수 맛집": { lat: 33.247, lng: 126.559 },
  "빙떡 전문점": { lat: 33.506, lng: 126.953 },
  "몸국 맛집": { lat: 33.499, lng: 126.531 },
  
  // 카페
  "제주 카페 드 몽드": { lat: 33.499, lng: 126.531 },
  "한라봉 카페": { lat: 33.458, lng: 126.942 },
  "제주 바다뷰 카페": { lat: 33.361, lng: 126.529 },
  "오설록 티뮤지엄": { lat: 33.393, lng: 126.239 },
  "제주 스타벅스": { lat: 33.239, lng: 126.414 },
  "한라산 카페": { lat: 33.305, lng: 126.289 },
  "우도 카페": { lat: 33.528, lng: 126.772 },
  "성산일출봉 카페": { lat: 33.247, lng: 126.559 },
  
  // 숙소
  "제주 그랜드 호텔": { lat: 33.499, lng: 126.531 },
  "제주 바다뷰 펜션": { lat: 33.458, lng: 126.942 },
  "제주 한라산 리조트": { lat: 33.361, lng: 126.529 },
  "제주 힐링 스테이": { lat: 33.393, lng: 126.239 },
  "우도 펜션": { lat: 33.239, lng: 126.414 },
  "성산 호텔": { lat: 33.305, lng: 126.289 },
  "제주 문화 호텔": { lat: 33.528, lng: 126.772 },
  "중문 리조트": { lat: 33.247, lng: 126.559 },
  "전통 한옥 스테이": { lat: 33.506, lng: 126.953 },
  "제주시 호텔": { lat: 33.499, lng: 126.531 },
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "관광지":
      return "#3b82f6" // blue
    case "맛집":
      return "#ef4444" // red
    case "카페":
      return "#f59e0b" // amber
    case "숙소":
      return "#10b981" // emerald
    default:
      return "#6b7280" // gray
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "관광지":
      return "●"
    case "맛집":
      return "▲"
    case "카페":
      return "◆"
    case "숙소":
      return "■"
    default:
      return "★"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "관광지":
      return "text-primary bg-primary/10"
    case "숙소":
      return "text-secondary bg-secondary/10"
    case "맛집":
      return "text-accent bg-accent/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

export default function ItineraryMap({ itinerary, activeDay, showAllDays = true }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 모든 장소 수집 (일차 필터링 적용)
  // log("🗺️ ItineraryMap 데이터 분석:", {
  //   itinerary,
  //   itineraryDays: itinerary.days,
  //   activeDay,
  //   showAllDays,
  //   firstDay: itinerary.days?.[0],
  //   firstDayItems: itinerary.days?.[0]?.items,
  //   daysWithNumbers: itinerary.days?.map(day => ({ dayNumber: day.day, hasItems: !!(day.items || day.places) }))
  // })

  // activeDay가 없으면 기본값 1 사용
  const currentActiveDay = activeDay || 1
  
  const allPlaces = itinerary.days
    .filter(day => {
      const shouldInclude = showAllDays || (currentActiveDay && day.day === currentActiveDay)
      log(`📅 일차 ${day.day} 필터링:`, { 
        shouldInclude, 
        showAllDays, 
        activeDay: currentActiveDay, 
        dayNumber: day.day,
        hasItems: !!(day.items || day.places)
      })
      return shouldInclude
    })
    .flatMap(day => {
      // items 또는 places 필드 지원
      const items = day.items || day.places || []
      log(`📍 일차 ${day.day} 아이템들:`, items)
      return items.map(item => ({
        name: item.label || item.name,
        category: item.category || item.type,
        day: day.day,
        slot: item.slot || item.time,
        ...PLACE_COORDINATES[item.label || item.name]
      }))
    }).filter(place => place.lat && place.lng)

  log("📍 필터링된 장소들:", allPlaces)
  log("🔍 activeDay 값:", activeDay, "showAllDays:", showAllDays)
  log("📊 일차별 장소 수:", allPlaces.reduce((acc, place) => {
    acc[place.day] = (acc[place.day] || 0) + 1
    return acc
  }, {} as Record<number, number>))

  // helper: 컨테이너가 실제로 layout 됐는지 확인
  const isContainerSized = () => {
    const el = mapRef.current as HTMLElement | null
    return !!el && el.offsetWidth > 0 && el.offsetHeight > 0
  }

  useEffect(() => {
    if (!mapRef.current) {
      setIsLoading(false)
      return
    }

    log('🗺️ 카카오맵 초기화 시작, 장소 수:', allPlaces.length, 'activeDay:', activeDay, 'showAllDays:', showAllDays)

    // 장소가 없어도 지도는 초기화해야 함
    if (allPlaces.length === 0) {
      log('⚠️ 표시할 장소가 없지만 지도는 초기화합니다')
    }

    // 카카오맵이 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      log('🗺️ 카카오맵이 이미 로드되어 있음, 바로 초기화')
      initializeMap()
      return
    }

    // 카카오맵 API 로드
    // 실제 카카오맵 API 키 사용
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    if (!apiKey) {
      return
    }
    log('🔑 카카오맵 API 키 사용:', apiKey.substring(0, 10) + '...')
    
    // 이미 스크립트가 로드되어 있는지 확인
    const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`)
    if (existingScript) {
      log('📜 기존 카카오맵 스크립트 발견, 재사용')
      if (window.kakao && window.kakao.maps) {
        initializeMap()
      } else {
        existingScript.addEventListener('load', () => {
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              initializeMap()
            })
          }
        })
      }
      return
    }
    
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true
    
    script.onload = () => {
      log('📜 카카오맵 스크립트 로드 완료')
      if (window.kakao && window.kakao.maps) {
        log('🗺️ 카카오맵 객체 확인됨, 초기화 시작')
        window.kakao.maps.load(() => {
          log('🗺️ 카카오맵 로드 콜백 실행')
          initializeMap()
        })
      } else {
        setIsLoading(false)
      }
    }
    
    script.onerror = (error) => {
      setIsLoading(false)
    }
    
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [allPlaces.length, currentActiveDay, showAllDays])

  // activeDay가 변경될 때마다 지도 다시 초기화
  useEffect(() => {
    if (map && currentActiveDay) {
      log('🔄 activeDay 변경으로 인한 지도 재초기화:', currentActiveDay)
      // 지도가 이미 초기화되어 있으면 마커만 업데이트
      setTimeout(() => {
        if (map && window.kakao && window.kakao.maps) {
          map.relayout()
        }
      }, 100)
    }
  }, [currentActiveDay, map])

    // 지도가 초기화된 후 activeDay나 allPlaces가 변경될 때 마커 업데이트
  useEffect(() => {
    if (!map || !window.kakao || !window.kakao.maps) {
      return
    }

    // 지도가 초기화된 후에도 컨테이너가 보이는지 확인하고 relayout 실행
    const checkAndRelayout = () => {
      const el = mapRef.current as HTMLElement | null
      if (!el) return

      const rect = el.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       window.getComputedStyle(el).display !== 'none' &&
                       window.getComputedStyle(el).visibility !== 'hidden'

      if (isVisible) {
        log('🔄 지도가 보임, relayout 실행')
        try {
          map.relayout && map.relayout()
          const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
          map.setCenter && map.setCenter(center)
        } catch (e) {
        }
      }
    }

    // 즉시 실행
    checkAndRelayout()

    // 1초 후에도 실행
    const timer = setTimeout(checkAndRelayout, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [map])

  useEffect(() => {
    if (!map || !window.kakao || !window.kakao.maps) {
      return
    }

    log('🔄 마커 업데이트 시작, activeDay:', currentActiveDay, '장소 수:', allPlaces.length)

    // 기존 마커들 제거
    markers.forEach(marker => {
      marker.setMap(null)
    })
    setMarkers([])

    // 새로운 마커들 생성
    const newMarkers: any[] = []
    const bounds = new window.kakao.maps.LatLngBounds()

    allPlaces.forEach((place, index) => {
      const position = new window.kakao.maps.LatLng(place.lat!, place.lng!)
      
      // 일차별로 다른 색상의 마커 생성
      const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
      const dayColor = dayColors[(place.day - 1) % dayColors.length]
      
      // 커스텀 마커 이미지 생성 (일차별 색상 + 카테고리 아이콘)
      const getCategorySymbol = (category: string) => {
        switch (category) {
          case "관광지":
            return "●"
          case "맛집":
            return "▲"
          case "카페":
            return "◆"
          case "숙소":
            return "■"
          default:
            return "★"
        }
      }

      // SVG 문자열을 안전하게 생성
      const svgString = `<svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <circle cx="25" cy="25" r="20" fill="${dayColor}" filter="url(#shadow)"/>
        <text x="25" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${getCategorySymbol(place.category)}</text>
        <polygon points="25,45 20,55 30,55" fill="${dayColor}"/>
      </svg>`

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const markerImage = new window.kakao.maps.MarkerImage(
        svgUrl,
        new window.kakao.maps.Size(50, 60),
        { offset: new window.kakao.maps.Point(25, 60) }
      )

      const marker = new window.kakao.maps.Marker({
        position,
        image: markerImage,
        title: place.name
      })

      // 인포윈도우 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${place.name}</div>
            <div style="font-size: 12px; color: #666;">${place.category}</div>
            <div style="font-size: 12px; color: #666;">${place.day}일차 • ${place.slot}</div>
          </div>
        `
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        markers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close()
          }
        })
        
        marker.infoWindow = infoWindow
        infoWindow.open(map, marker)
      })

      marker.infoWindow = infoWindow
      marker.setMap(map)
      newMarkers.push(marker)
      bounds.extend(position)
    })

    setMarkers(newMarkers)
    
    // 지도 범위 조정
    if (allPlaces.length > 0) {
      map.setBounds(bounds)
      log('✅ 마커 업데이트 완료, 마커 수:', newMarkers.length)
    } else {
      // 장소가 없으면 제주도 중심으로 설정
      const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
      map.setCenter(center)
      map.setLevel(8)
      log('✅ 지도 중심 설정 완료 (장소 없음)')
    }
    
    // 탭 전환 시에도 relayout 실행 (지도 크기 재계산)
    setTimeout(() => {
      log('🔄 탭 전환 시 relayout 실행')
      map.relayout()
    }, 100)
  }, [map, currentActiveDay, allPlaces.length])

  const initializeMap = () => {
    log('🗺️ initializeMap 함수 시작')
    
    if (!window.kakao || !window.kakao.maps) {
      setIsLoading(false)
      return
    }

    if (!mapRef.current) {
      setIsLoading(false)
      return
    }

    log('🗺️ 지도 초기화 중...')

    // 제주도 중심 좌표
    const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
    
    const options = {
      center,
      level: 8
    }

    let kakaoMap: any
    try {
      kakaoMap = new window.kakao.maps.Map(mapRef.current, options)
      log('🗺️ 지도 객체 생성 완료')
      setMap(kakaoMap)
    } catch (error) {
      setIsLoading(false)
      return
    }

    // 마커 생성 함수
    const createMarkers = (mapInstance: any) => {
      const newMarkers: any[] = []
      const bounds = new window.kakao.maps.LatLngBounds()

      log('📍 마커 생성 시작, 장소 수:', allPlaces.length)
      log('🎯 마커 생성할 장소들:', allPlaces.map(p => `${p.name} (${p.day}일차)`))

      allPlaces.forEach((place, index) => {
        const position = new window.kakao.maps.LatLng(place.lat!, place.lng!)
        
        // 일차별로 다른 색상의 마커 생성
        const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        const dayColor = dayColors[(place.day - 1) % dayColors.length]
        
        // 커스텀 마커 이미지 생성 (일차별 색상 + 카테고리 아이콘)
        const getCategorySymbol = (category: string) => {
          switch (category) {
            case "관광지":
              return "●"
            case "맛집":
              return "▲"
            case "카페":
              return "◆"
            case "숙소":
              return "■"
            default:
              return "★"
          }
        }

        // SVG 문자열을 안전하게 생성
        const svgString = `<svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <path d="M25 0C11.193 0 0 11.193 0 25c0 18.75 25 35 25 35s25-16.25 25-35C50 11.193 38.807 0 25 0z" 
                fill="${dayColor}" filter="url(#shadow)"/>
          <circle cx="25" cy="25" r="18" fill="white" opacity="0.9"/>
          <text x="25" y="32" text-anchor="middle" fill="${dayColor}" font-size="18" font-family="Arial" font-weight="bold">${getCategorySymbol(place.category)}</text>
          <text x="25" y="45" text-anchor="middle" fill="white" font-size="10" font-family="Arial" font-weight="bold">D${place.day}</text>
        </svg>`
        
        // URL 인코딩을 사용하여 안전하게 처리
        const markerImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
        
        const markerImage = new window.kakao.maps.MarkerImage(
          markerImageSrc,
          new window.kakao.maps.Size(50, 60),
          { offset: new window.kakao.maps.Point(25, 60) }
        )

        const marker = new window.kakao.maps.Marker({
          position,
          image: markerImage,
          title: place.name,
          clickable: true
        })

        // 개선된 인포윈도우 생성
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 150px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">${getCategoryIcon(place.category)}</span>
                <div>
                  <div style="font-weight: bold; font-size: 14px; color: #1f2937; margin-bottom: 2px;">${place.name}</div>
                  <div style="font-size: 12px; color: #6b7280;">${place.category}</div>
                </div>
              </div>
              <div style="background: #f3f4f6; padding: 6px 8px; border-radius: 4px; font-size: 11px; color: #374151;">
                📅 ${place.day}일차 • ${place.slot}
              </div>
            </div>
          `,
          removable: true
        })

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          // 다른 인포윈도우 닫기
          newMarkers.forEach(m => {
            if (m.infoWindow) {
              m.infoWindow.close()
            }
          })
          
          marker.infoWindow = infoWindow
          infoWindow.open(mapInstance, marker)
        })

        marker.setMap(mapInstance)
        newMarkers.push(marker)
        bounds.extend(position)
      })

      setMarkers(newMarkers)
      
      // 지도 범위 조정
      if (allPlaces.length > 0) {
        mapInstance.setBounds(bounds)
        log('✅ 지도 범위 조정 완료')
      } else {
        // 장소가 없으면 제주도 중심으로 설정
        const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
        mapInstance.setCenter(center)
        mapInstance.setLevel(8)
        log('✅ 지도 중심 설정 완료 (장소 없음)')
      }
      
      log('✅ 지도 초기화 완료, 마커 수:', newMarkers.length)
      setIsLoading(false)
    }

    // 마커 생성 실행
    createMarkers(kakaoMap)
    
    // 최초 로드 시에도 relayout 실행 (지도 컨테이너 크기 문제 해결)
    setTimeout(() => {
      log('🔄 최초 로드 시 relayout 실행')
      kakaoMap.relayout()
      // 지도 중심도 다시 설정
      const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
      kakaoMap.setCenter(center)
    }, 500)
    
    // 지도 초기화 후 약간의 지연을 두고 마커 업데이트 실행
    setTimeout(() => {
      log('🔄 지도 초기화 후 마커 업데이트 실행')
      if (allPlaces.length > 0) {
        // 기존 마커들 제거
        markers.forEach(marker => {
          marker.setMap(null)
        })
        setMarkers([])

        // 새로운 마커들 생성
        const newMarkers: any[] = []
        const bounds = new window.kakao.maps.LatLngBounds()

        allPlaces.forEach((place, index) => {
          const position = new window.kakao.maps.LatLng(place.lat!, place.lng!)
          
          // 일차별로 다른 색상의 마커 생성
          const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
          const dayColor = dayColors[(place.day - 1) % dayColors.length]
          
          // 커스텀 마커 이미지 생성
          const getCategorySymbol = (category: string) => {
            switch (category) {
              case "관광지":
                return "●"
              case "맛집":
                return "▲"
              case "카페":
                return "◆"
              case "숙소":
                return "■"
              default:
                return "★"
            }
          }

          // SVG 문자열 생성
          const svgString = `<svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <circle cx="25" cy="25" r="20" fill="${dayColor}" filter="url(#shadow)"/>
            <text x="25" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${getCategorySymbol(place.category)}</text>
            <polygon points="25,45 20,55 30,55" fill="${dayColor}"/>
          </svg>`

          const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
          const svgUrl = URL.createObjectURL(svgBlob)

          const markerImage = new window.kakao.maps.MarkerImage(
            svgUrl,
            new window.kakao.maps.Size(50, 60),
            { offset: new window.kakao.maps.Point(25, 60) }
          )

          const marker = new window.kakao.maps.Marker({
            position,
            image: markerImage,
            title: place.name
          })

          // 인포윈도우 생성
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding: 10px; min-width: 150px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${place.name}</div>
                <div style="font-size: 12px; color: #666;">${place.category}</div>
                <div style="font-size: 12px; color: #666;">${place.day}일차 • ${place.slot}</div>
              </div>
            `
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 다른 인포윈도우 닫기
            newMarkers.forEach(m => {
              if (m.infoWindow) {
                m.infoWindow.close()
              }
            })
            
            marker.infoWindow = infoWindow
            infoWindow.open(kakaoMap, marker)
          })

          marker.infoWindow = infoWindow
          marker.setMap(kakaoMap)
          newMarkers.push(marker)
          bounds.extend(position)
        })

        setMarkers(newMarkers)
        
        // 지도 범위 조정
        if (allPlaces.length > 0) {
          kakaoMap.setBounds(bounds)
          log('✅ 초기 마커 업데이트 완료, 마커 수:', newMarkers.length)
        }
        
        // 초기 마커 업데이트 후에도 relayout 실행
        setTimeout(() => {
          log('🔄 초기 마커 업데이트 후 relayout 실행')
          kakaoMap.relayout()
        }, 100)
      }
    }, 500)
  }

  // visible 되면 맵 초기화 또는 relayout
  const ensureMapReady = async () => {
    const el = mapRef.current as HTMLElement | null
    if (!el) return

    log('🗺️ 지도 준비 확인 시작, 장소 수:', allPlaces.length, 'activeDay:', activeDay)

    // 컨테이너가 실제로 보이는지 확인 (display: none이 아닌지)
    const rect = el.getBoundingClientRect()
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     window.getComputedStyle(el).display !== 'none' &&
                     window.getComputedStyle(el).visibility !== 'hidden'

    log('📐 컨테이너 상태:', {
      width: rect.width,
      height: rect.height,
      isVisible,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility
    })

    if (!isVisible) {
      log('⚠️ 컨테이너가 보이지 않음, 1초 후 재시도')
      setTimeout(() => {
        ensureMapReady()
      }, 1000)
      return
    }

    // 만약 map이 이미 있으면 relayout + setCenter 시도
    if (map) {
      log('🔄 기존 지도 relayout 시도')
      // 약간의 딜레이로 브라우저 레이아웃 안정화 후 relayout
      setTimeout(() => {
        try {
          map.relayout && map.relayout()
          const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
          map.setCenter && map.setCenter(center)
          log('✅ 지도 relayout 성공')
        } catch (e) {
          setMap(null)
          initializeMap() // 맵 재생성
        }
      }, 150)
      return
    }

    // map이 없으면 바로 생성
    log('✅ 컨테이너가 보임, 지도 생성')
    initializeMap()
  }

  // 카카오맵 API 로드 실패 시 대체 UI
  if (!window.kakao || !window.kakao.maps) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">여행 경로 지도</h3>
        </div>
        
        <div className="w-full h-96 bg-muted rounded-lg border border-border p-4">
          <div className="text-center mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">카카오맵 API 키가 필요합니다</p>
            <p className="text-xs text-muted-foreground">
              실제 지도를 보려면 카카오 개발자 센터에서 API 키를 발급받아주세요
            </p>
          </div>
          
          {/* 좌표 정보 표시 */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-sm text-foreground">장소 위치 정보</h4>
            {allPlaces.map((place, index) => (
              <div key={index} className="bg-background rounded p-2 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getCategoryIcon(place.category)}</span>
                  <span className="font-medium">{place.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(place.category)}`}>
                    {place.category}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  📍 좌표: {place.lat?.toFixed(4)}, {place.lng?.toFixed(4)}
                  <span className="ml-2">📅 {place.day}일차 • {place.slot}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 장소 목록으로 대체 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itinerary.days.map((day, dayIndex) => {
            const items = day.items || day.places || []
            return (
              <div key={dayIndex} className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                    {day.day}
                  </span>
                  {day.day}일차
                </h4>
                <div className="space-y-2">
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-sm">
                      <span className={`text-lg ${getCategoryColor(item.category || item.type)}`}>{getCategoryIcon(item.category || item.type)}</span>
                      <span className="font-medium text-foreground">{item.label || item.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.category || item.type)}`}>
                        {item.category || item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>관광지</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>맛집</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>카페</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span>숙소</span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mx-auto mb-2"></div>
          <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">여행 경로 지도</h3>
      </div>
      
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-border kakao-map-container"
        style={{ height: '360px', minHeight: '360px' }}
      />
      
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-sm">범례</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* 카테고리별 아이콘 */}
          <div className="space-y-2">
            <div className="font-medium text-muted-foreground mb-2">카테고리</div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-blue-500">●</span>
              <span>관광지</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-red-500">▲</span>
              <span>맛집</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-amber-500">◆</span>
              <span>카페</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-emerald-500">■</span>
              <span>숙소</span>
            </div>
          </div>
          
          {/* 일차별 색상 */}
          <div className="space-y-2">
            <div className="font-medium text-muted-foreground mb-2">일차별 색상</div>
            {allPlaces.reduce((acc: any[], place) => {
              if (!acc.find(p => p.day === place.day)) {
                acc.push(place)
              }
              return acc
            }, []).sort((a, b) => a.day - b.day).map((place) => {
              const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
              const dayColor = dayColors[(place.day - 1) % dayColors.length]
              return (
                <div key={place.day} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: dayColor }}
                  ></div>
                  <span>{place.day}일차</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


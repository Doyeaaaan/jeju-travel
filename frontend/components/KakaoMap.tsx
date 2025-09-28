"use client"

import { useEffect, useRef } from "react"

interface Place {
  id: number
  placeId: string
  type: string
  placeName?: string
  latitude?: number
  longitude?: number
  sequence: number
}

interface KakaoMapProps {
  places: Place[]
  width?: string
  height?: string
}

declare global {
  interface Window {
    kakao: any
  }
}

export default function KakaoMap({ places, width = "100%", height = "400px" }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const overlaysRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)

  // 디버깅을 위한 로그

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      if (!mapRef.current) return

      // 카카오맵이 완전히 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
        return
      }

      // 제주도 중심 좌표
      const center = new window.kakao.maps.LatLng(33.4996, 126.5312)
      
      const options = {
        center,
        level: 8
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map

      // 기존 마커, 오버레이, 경로 제거
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      overlaysRef.current.forEach(overlay => overlay.setMap(null))
      overlaysRef.current = []
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }

      // 장소들을 순서대로 정렬하여 마커로 표시
      const validPlaces = places
        .filter(place => place.latitude && place.longitude)
        .sort((a, b) => a.sequence - b.sequence) // sequence로 정렬
      
      if (validPlaces.length > 0) {
        const positions: any[] = []
        
        // 같은 좌표의 마커들을 위한 오프셋 계산
        const coordinateCounts = new Map<string, number>()
        
        // 모든 장소에 대해 마커 생성
        validPlaces.forEach((place, index) => {
          // 좌표 키 생성
          const coordKey = `${place.latitude},${place.longitude}`
          const count = coordinateCounts.get(coordKey) || 0
          coordinateCounts.set(coordKey, count + 1)

          // 같은 좌표의 마커들에 오프셋 적용
          let offsetLat = place.latitude
          let offsetLng = place.longitude
          
          if (count > 0) {
            // 같은 좌표에 여러 마커가 있을 때 약간씩 오프셋
            const offsetDistance = 0.001 // 약 100m 정도
            offsetLat += (count * offsetDistance * Math.cos(count * Math.PI / 4))
            offsetLng += (count * offsetDistance * Math.sin(count * Math.PI / 4))
          }

          const position = new window.kakao.maps.LatLng(offsetLat, offsetLng)
          positions.push(position)

          // 기본 마커 생성 (숨김 처리)
          const marker = new window.kakao.maps.Marker({
            position,
            map,
            image: new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
              new window.kakao.maps.Size(1, 1),
              { offset: new window.kakao.maps.Point(0, 0) }
            )
          })

          // 마커에 순서 표시 (sequence 값 사용)
          const markerContent = `
            <div style="
              background: #007bff; 
              color: white; 
              border-radius: 50%; 
              width: 30px; 
              height: 30px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold;
              font-size: 14px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              z-index: 1000;
            ">
              ${index + 1}
            </div>
          `

          const customOverlay = new window.kakao.maps.CustomOverlay({
            content: markerContent,
            position,
            map,
            yAnchor: 0.5,
            xAnchor: 0.5
          })
          
          // 오버레이를 별도로 관리
          overlaysRef.current.push(customOverlay)

          // 마커 클릭 시 정보창 표시
          const placeName = place.placeName || `장소 ${place.sequence}`
          const infoContent = `
            <div style="padding: 10px; min-width: 150px;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px;">${placeName}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">순서: ${place.sequence}</p>
            </div>
          `

          const infowindow = new window.kakao.maps.InfoWindow({
            content: infoContent
          })

          // 커스텀 오버레이 클릭 시 정보창 표시
          window.kakao.maps.event.addListener(customOverlay, 'click', () => {
            infowindow.open(map, marker)
          })

          markersRef.current.push(marker)
        })

        // 경로 그리기 (2개 이상의 장소가 있을 때)
        if (positions.length > 1) {
          const polyline = new window.kakao.maps.Polyline({
            path: positions,
            strokeWeight: 3,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
          })

          polyline.setMap(map)
          polylineRef.current = polyline
        }

        // 모든 마커가 보이도록 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds()
        positions.forEach(position => {
        bounds.extend(position)
      })
      map.setBounds(bounds)
    }
    }

    // 카카오맵이 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      window.kakao.maps.load(() => {
        initMap()
      })
    } else {
      // 스크립트가 로드될 때까지 대기
      const checkKakaoMap = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            initMap()
          })
        } else {
          setTimeout(checkKakaoMap, 100)
        }
      }
      checkKakaoMap()
    }
  }, [places])

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
      />
      {places.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '14px'
        }}>
          선택된 장소가 없습니다
        </div>
      )}
    </div>
  )
}

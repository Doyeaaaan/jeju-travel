"use client"

import { useEffect, useRef } from "react"

declare global {
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

interface KakaoMapProps {
  width?: string
  height?: string
  markers?: MarkerData[]
  options?: {
    center?: {
      lat: number
      lng: number
    }
    level?: number
  }
}

export default function KakaoMap({ width = "100%", height = "400px", markers = [], options = {} }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    if (!apiKey) {
      return
    }
    
    const script = document.createElement("script")
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    document.head.appendChild(script)

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          const defaultCenter = new window.kakao.maps.LatLng(33.3617, 126.5292)
          const center = options.center
            ? new window.kakao.maps.LatLng(options.center.lat, options.center.lng)
            : defaultCenter


          const mapOption = {
            center: center,
            level: options.level || 5,
          }

          const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
          mapRef.current = map

          // 인포윈도우 생성
          infoWindowRef.current = new window.kakao.maps.InfoWindow({
            zIndex: 1,
          })

          // 마커 추가
          updateMarkers()
        } else {
        }
      })
    }

    script.onerror = (error) => {
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers()
    }
  }, [markers])

  const updateMarkers = () => {
    
    if (!mapRef.current || !window.kakao) {
      return
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    markersRef.current = []

    // 새 마커 추가
    markers.forEach((markerData) => {
      const markerPosition = new window.kakao.maps.LatLng(markerData.position.lat, markerData.position.lng)

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: markerData.title,
      })

      marker.setMap(mapRef.current)
      markersRef.current.push(marker)

      // 마커 클릭 이벤트
      if (markerData.content) {
        window.kakao.maps.event.addListener(marker, "click", () => {
          infoWindowRef.current.setContent(markerData.content)
          infoWindowRef.current.open(mapRef.current, marker)
        })
      }
    })

    // 마커가 있으면 지도 범위 조정
    if (markers.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds()
      markers.forEach((markerData) => {
        bounds.extend(new window.kakao.maps.LatLng(markerData.position.lat, markerData.position.lng))
      })
      mapRef.current.setBounds(bounds)
    }
  }

  return (
    <div
      ref={mapContainer}
      style={{
        width,
        height,
      }}
      className="rounded-lg overflow-hidden"
    />
  )
}

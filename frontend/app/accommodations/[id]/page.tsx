"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Share2, Bookmark, Heart, ArrowLeft } from "lucide-react"
import KakaoMap from "../../../components/kakao-map"
import ReviewSection from "@/components/review-section"
import { accommodationService } from "../../../lib/accommodation-service"

interface Room {
  roomId: string
  roomName: string
  price: number
  images: string[]
}

interface Place {
  id: number
  name: string
  grade?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  address?: string
}

export default function AccommodationDetailPage() {
  const params = useParams()
  const [place, setPlace] = useState<Place | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAccommodationDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        // params.id가 없는 경우 에러 처리
        if (!params.id) {
          throw new Error("숙소 ID가 없습니다.")
        }

        // 기본 날짜 설정
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // params.id가 배열인 경우 첫 번째 값을 사용
        const id = Array.isArray(params.id) ? params.id[0] : params.id


        // 숙소 정보 로드
        const placesData = await accommodationService.searchPlaces(
          "제주",
          today.toISOString().split('T')[0],
          tomorrow.toISOString().split('T')[0],
          2,
          100
        )
        
        // ID로 해당 숙소 찾기
        const placeLocation = placesData.find((place: any) => place.id === parseInt(id))
        
        if (!placeLocation) {
          throw new Error("숙소 정보를 찾을 수 없습니다.")
        }
        setPlace(placeLocation)

        // 객실 목록 로드
        const roomsData = await accommodationService.searchRooms(
          id,
          today.toISOString().split('T')[0],
          tomorrow.toISOString().split('T')[0],
          2
        )
        setRooms(roomsData)

      } catch (error: any) {
        setError(error.message || "숙소 정보를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadAccommodationDetail()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8">
        <div className="text-center py-12">
          <div className="text-lg">숙소 정보를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8">
        <div className="text-center py-12">
          <div className="text-red-500">{error || "숙소 정보를 찾을 수 없습니다."}</div>
          <Link href="/accommodations" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            숙소 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white pb-8">
      {/* 뒤로 가기 버튼 */}
      <div className="p-4">
        <Link
          href="/accommodations"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          숙소 목록으로 돌아가기
        </Link>
      </div>

      <div className="relative h-80">
        <Image
          src={place.imageUrl || "/placeholder.svg?height=320&width=800"}
          alt={place.name}
          fill
          className="object-cover rounded-lg"
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="p-2 bg-white rounded-full shadow-md">
            <Share2 size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Bookmark size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold">{place.name}</h1>
        {place.grade && (
          <div className="mt-1 text-gray-600">{place.grade}</div>
        )}


        <div className="flex items-center mt-4 text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          <span>{place.address || "위치 정보 없음"}</span>
        </div>

        {/* 객실 목록 */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">객실 목록</h2>
          {rooms.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">현재 예약 가능한 객실이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{room.roomName}</h3>
                      {room.images && room.images.length > 0 && (
                        <div className="mt-4 relative h-48 w-full sm:w-64">
                          <Image
                            src={room.images[0]}
                            alt={room.roomName}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">1박 기준</div>
                      <div className="text-xl font-bold">
                        {room.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

                <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">위치</h2>
          
                      {/* 지도 크기 제한 컨테이너 */}
            <div style={{ 
              width: '100%', 
              height: '200px', 
              maxWidth: '100%', 
              maxHeight: '200px',
              overflow: 'hidden',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}>
              <KakaoMap
                width="100%"
                height="200px"
                options={{
                  center: {
                    lat: place.latitude || 33.3617, // 기본값: 제주도 중심
                    lng: place.longitude || 126.5292
                  },
                  level: 3
                }}
                markers={place.latitude && place.longitude ? [
                  {
                    id: place.id.toString(),
                    position: {
                      lat: place.latitude,
                      lng: place.longitude
                    },
                    title: place.name,
                    content: `<div style="padding:10px;"><strong>${place.name}</strong><br/>${place.address || ""}</div>`,
                  },
                ] : []}
              />
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="mt-8">
          {React.createElement(ReviewSection as any, {
            destinationId: place.id,
            placeType: "accommodation"
          })}
        </div>
      </div>
    </div>
  )
}

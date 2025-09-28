"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { use } from "react"
import { MapPin, Clock, Star, Share2, Bookmark, Heart } from "lucide-react"
import ReviewSection from "@/components/review-section"
import NearbyAttractions from "@/components/nearby-attractions"
import KakaoMap from "@/components/kakao-map"
import { attractionService, type Place } from "@/lib/attraction-service"

export default function AttractionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [destination, setDestination] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDestination = async () => {
      try {
        setLoading(true)
        setError(null)
        
        
        // 새로운 상세보기 API 사용
        const destinationDetail = await attractionService.getAttractionDetail(resolvedParams.id)
        
        if (destinationDetail) {
          setDestination(destinationDetail)
        } else {
          setError("관광지 정보를 찾을 수 없습니다.")
        }
      } catch (error) {
        setError("관광지 정보를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadDestination()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white pb-8">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">관광지 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !destination) {
    return (
      <div className="max-w-4xl mx-auto bg-white pb-8">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">{error || "관광지 정보를 찾을 수 없습니다."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white pb-8">
      <div className="relative h-80 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10">배경사진</div>
        {destination.imageUrl && (
          <Image
            src={destination.imageUrl || "/placeholder.svg"}
            alt={destination.name}
            fill
            className="object-cover z-20"
          />
        )}
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
        <h1 className="text-2xl font-bold">{destination.name}</h1>


        <div className="flex items-center mt-4 text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          <span>{destination.roadAddress || destination.address || "주소 정보 없음"}</span>
        </div>

        {destination.phone && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span className="mr-1">📞</span>
            <span>{destination.phone}</span>
          </div>
        )}

        {destination.placeUrl && (
          <div className="mt-2">
            <a 
              href={destination.placeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              📍 카카오맵에서 보기
            </a>
          </div>
        )}

        {destination.tag && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {destination.tag.split(',').map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {destination.introduction && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-2">소개</h2>
            <p className="text-gray-700 leading-relaxed">{destination.introduction}</p>
          </div>
        )}

        {destination.detailInfo && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-2">상세 정보</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{destination.detailInfo}</pre>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">위치</h2>
          {destination.latitude && destination.longitude ? (
            <KakaoMap
              width="100%"
              height="400px"
              markers={[
                {
                  id: destination.id,
                  position: {
                    lat: destination.latitude,
                    lng: destination.longitude
                  },
                  title: destination.name,
                  content: `
                    <div style="padding: 10px;">
                      <h3 style="font-weight: bold; margin-bottom: 5px;">${destination.name}</h3>
                      <p style="margin: 0; color: #666;">${destination.address || '주소 정보 없음'}</p>
                    </div>
                  `
                }
              ]}
              options={{
                center: {
                  lat: destination.latitude,
                  lng: destination.longitude
                },
                level: 3
              }}
            />
          ) : (
            <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">위치 정보가 없습니다.</p>
            </div>
          )}
        </div>

        <ReviewSection destinationId={parseInt(destination.id) || 1} />

        <NearbyAttractions currentId={destination.id} />
      </div>
    </div>
  )
}

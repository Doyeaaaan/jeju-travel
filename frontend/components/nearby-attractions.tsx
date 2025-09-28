"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Clock, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { attractionService } from "@/lib/attraction-service"

interface NearbyAttractionsProps {
  currentId: number | string
}

export default function NearbyAttractions({ currentId }: NearbyAttractionsProps) {
  const [nearbyAttractions, setNearbyAttractions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const loadNearbyAttractions = async () => {
      try {
        setLoading(true)
        
        // 단일 페이지에서 충분한 데이터 가져오기 (더 빠르고 안정적)
        const attractions = await attractionService.getAttractions(1, 100)
        
        // currentId가 없으면 함수 종료
        if (!currentId) {
          return
        }

        // 현재 관광지 찾기 (여러 방법으로 시도)
        let currentAttraction = attractions.find(attraction => 
          attraction.id === currentId.toString()
        )
        
        // ID로 찾지 못하면 contentsId로도 시도
        if (!currentAttraction) {
          currentAttraction = attractions.find(attraction => 
            attraction.contentsId === currentId.toString()
          )
        }
        
        // 여전히 못 찾으면 ID에 CNTS_ 접두사가 있는지 확인
        if (!currentAttraction && currentId.toString().startsWith('CNTS_')) {
          currentAttraction = attractions.find(attraction => 
            attraction.id === currentId.toString() || 
            attraction.contentsId === currentId.toString()
          )
        }
        
        if (!currentAttraction) {
          setNearbyAttractions([])
          return
        }
        
          `(${currentAttraction.latitude}, ${currentAttraction.longitude})`)

        // 현재 관광지 제외하고 거리 계산 후 정렬
        const nearbyWithDistance = attractions
          .filter((attraction) => attraction.id !== currentId.toString())
          .map((attraction) => {
            const distance = calculateDistance(
              currentAttraction.latitude, currentAttraction.longitude,
              attraction.latitude, attraction.longitude
            )
            return {
              ...attraction,
              distance: Math.round(distance * 10) / 10 // 소수점 첫째자리까지
            }
          })
          .sort((a, b) => a.distance - b.distance) // 거리순 정렬
          .slice(0, 6) // 가장 가까운 6개

          nearbyWithDistance.map(a => `${a.name} (${a.distance}km)`))

        setNearbyAttractions(nearbyWithDistance)
      } catch (error) {
        setNearbyAttractions([])
      } finally {
        setLoading(false)
      }
    }

    loadNearbyAttractions()
  }, [currentId])

  const toggleFavorite = (attractionId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(attractionId)) {
        newFavorites.delete(attractionId)
      } else {
        newFavorites.add(attractionId)
      }
      return newFavorites
    })
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-6">🏃‍♂️ 가까운 관광지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (nearbyAttractions.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-6">🏃‍♂️ 가까운 관광지</h2>
        <div className="text-center py-8 text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
          <p>주변 관광지 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-6">🏃‍♂️ 가까운 관광지</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyAttractions.map((attraction) => {
          const isFavorite = favorites.has(attraction.contentsId || attraction.id)

          return (
            <Card
              key={attraction.contentsId || attraction.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="h-48 relative">
                  <Image
                    src={attraction.imageUrl || "/placeholder.svg?height=192&width=384&text=관광지"}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=192&width=384&text=이미지없음"
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(attraction.contentsId || attraction.id)}
                >
                  <Heart size={16} className={isFavorite ? "text-red-500 fill-current" : "text-gray-600"} />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{attraction.name}</h3>

                {attraction.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{attraction.rating}</span>
                    <span className="text-sm text-gray-600">({attraction.reviewCount || 0})</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{attraction.address || "주소 정보 없음"}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  {attraction.hours && (
                    <>
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span className="text-sm">{attraction.hours}</span>
                    </>
                  )}
                  <span className="ml-auto text-sm font-medium text-orange-600">
                    {attraction.distance}km
                  </span>
                </div>

                <Link href={`/attractions/${attraction.contentsId || attraction.id}`} className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">자세히 보기</Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

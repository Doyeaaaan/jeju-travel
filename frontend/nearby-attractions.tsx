import Image from "next/image"
import Link from "next/link"
import { destinations } from "@/data/destinations"

export default function NearbyAttractions({ currentId }: { currentId: number }) {
  // 현재 관광지를 제외한 다른 관광지 중에서 3개를 랜덤하게 선택
  const nearbyAttractions = destinations
    .filter((d) => d.id !== currentId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">주변 관광지</h2>
      <div className="grid grid-cols-3 gap-4">
        {nearbyAttractions.map((attraction) => (
          <Link
            href={`/attractions/${attraction.id}`}
            key={attraction.id}
            className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-24 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                사진
              </div>
              {attraction.image && (
                <Image
                  src={attraction.image || "/placeholder.svg"}
                  alt={attraction.name}
                  fill
                  className="object-cover z-20"
                />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-bold">{attraction.name}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-yellow-500">★★★★★</span>
                <span className="text-xs text-gray-500 ml-1">({attraction.reviewCount})</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

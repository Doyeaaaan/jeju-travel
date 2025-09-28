import Image from "next/image"
import Link from "next/link"
import { restaurants } from "@/data/restaurants"
import { ChevronRight, Star } from "lucide-react"

export default function BestRestaurants() {
  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">제주도 인생 맛집</h2>
        <Link href="/restaurants" className="text-sm text-[#FF7A00] hover:underline flex items-center gap-1">
          더보기 <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {restaurants.slice(0, 3).map((restaurant) => (
          <Link
            href={`/restaurants/${restaurant.id}`}
            key={restaurant.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <div className="h-48 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                사진
              </div>
              {restaurant.image && (
                <Image
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  fill
                  className="object-cover z-20 group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium z-30">
                {restaurant.category}
              </div>
            </div>
            <div className="p-4">
              <p className="font-bold text-lg">{restaurant.name}</p>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-500">
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                </div>
                <span className="text-sm text-gray-500 ml-2">({restaurant.reviewCount})</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

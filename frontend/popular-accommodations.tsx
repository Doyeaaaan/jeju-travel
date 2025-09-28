import Image from "next/image"
import Link from "next/link"
import { accommodations } from "@/data/accommodations"
import { ChevronRight, Star } from "lucide-react"

export default function PopularAccommodations() {
  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">이번 주 HOT 인기 숙소</h2>
        <Link href="/accommodations" className="text-sm text-[#FF7A00] hover:underline flex items-center gap-1">
          더보기 <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accommodations.slice(0, 3).map((accommodation) => (
          <Link
            href={`/accommodations/${accommodation.id}`}
            key={accommodation.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <div className="h-48 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                사진
              </div>
              {accommodation.image && (
                <Image
                  src={accommodation.image || "/placeholder.svg"}
                  alt={accommodation.name}
                  fill
                  className="object-cover z-20 group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium z-30">
                {accommodation.price}
              </div>
            </div>
            <div className="p-4">
              <p className="font-bold text-lg">{accommodation.name}</p>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-500">
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                </div>
                <span className="text-sm text-gray-500 ml-2">({accommodation.reviewCount})</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

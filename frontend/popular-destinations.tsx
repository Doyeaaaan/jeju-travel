import Image from "next/image"
import Link from "next/link"
import { destinations } from "@/data/destinations"
import { ChevronRight } from "lucide-react"

export default function PopularDestinations() {
  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">제주도 인기 여행지</h2>
        <Link href="/attractions" className="text-sm text-[#FF7A00] hover:underline flex items-center gap-1">
          더보기 <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.slice(0, 3).map((destination) => (
          <Link
            href={`/attractions/${destination.id}`}
            key={destination.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-48 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                사진
              </div>
              {destination.image && (
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  fill
                  className="object-cover z-20 group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="p-4">
              <p className="font-bold text-lg">{destination.name}</p>
              <p className="text-gray-600 mt-2 line-clamp-2">{destination.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

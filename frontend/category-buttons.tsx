import Link from "next/link"
import { Plane, Home, MapPin, Utensils } from "lucide-react"

export default function CategoryButtons() {
  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4">카테고리</h2>
      <div className="grid grid-cols-4 gap-3">
        <Link
          href="/flights"
          className="flex flex-col items-center justify-center p-5 rounded-xl hover:bg-[#FFF0E6] transition-colors border border-gray-100 shadow-sm hover:shadow-md"
        >
          <div className="bg-[#FFF0E6] p-3 rounded-full mb-3">
            <Plane className="text-[#FF7A00]" size={24} />
          </div>
          <span className="text-sm font-medium">비행기</span>
        </Link>
        <Link
          href="/accommodations"
          className="flex flex-col items-center justify-center p-5 rounded-xl hover:bg-[#FFF0E6] transition-colors border border-gray-100 shadow-sm hover:shadow-md"
        >
          <div className="bg-[#FFF0E6] p-3 rounded-full mb-3">
            <Home className="text-[#FF7A00]" size={24} />
          </div>
          <span className="text-sm font-medium">숙소</span>
        </Link>
        <Link
          href="/attractions"
          className="flex flex-col items-center justify-center p-5 rounded-xl hover:bg-[#FFF0E6] transition-colors border border-gray-100 shadow-sm hover:shadow-md"
        >
          <div className="bg-[#FFF0E6] p-3 rounded-full mb-3">
            <MapPin className="text-[#FF7A00]" size={24} />
          </div>
          <span className="text-sm font-medium">관광지</span>
        </Link>
        <Link
          href="/restaurants"
          className="flex flex-col items-center justify-center p-5 rounded-xl hover:bg-[#FFF0E6] transition-colors border border-gray-100 shadow-sm hover:shadow-md"
        >
          <div className="bg-[#FFF0E6] p-3 rounded-full mb-3">
            <Utensils className="text-[#FF7A00]" size={24} />
          </div>
          <span className="text-sm font-medium">맛집</span>
        </Link>
      </div>
    </div>
  )
}

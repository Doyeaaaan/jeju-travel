import Image from "next/image"
import Link from "next/link"
import { restaurants } from "@/data/restaurants"
import { MapPin, Clock, Star, Share2, Bookmark, Heart, DollarSign, Phone, Globe } from "lucide-react"

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const restaurant = restaurants.find((r) => r.id.toString() === params.id) || restaurants[0]

  return (
    <div className="max-w-4xl mx-auto bg-white pb-8">
      <div className="relative h-80">
        {restaurant.image && (
          <Image
            src={restaurant.image || "/placeholder.svg?height=320&width=800"}
            alt={restaurant.name}
            fill
            className="object-cover rounded-lg"
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
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>

        <div className="flex items-center mt-2">
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">{restaurant.category}</span>
        </div>

        <div className="flex items-center mt-4 text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          <span>{restaurant.address}</span>
        </div>

        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          <span>{restaurant.hours}</span>
        </div>

        <div className="flex items-center mt-2 text-sm text-gray-500">
          <DollarSign size={16} className="mr-1" />
          <span>가격대: {restaurant.price}</span>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">소개</h2>
          <p className="text-gray-700">{restaurant.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">대표 메뉴</h2>
          <div className="space-y-3">
            {restaurant.signature.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">사진</h2>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-24 bg-gray-200 rounded-md flex items-center justify-center">
                사진
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">위치</h2>
          <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center">지도</div>
        </div>

        <div className="mt-6 border-t pt-6 flex justify-between">
          <Link href="#" className="px-6 py-3 border border-black rounded-md font-medium flex items-center">
            <Phone size={18} className="mr-2" />
            전화하기
          </Link>
          <Link
            href="#"
            className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium flex items-center hover:bg-orange-600"
          >
            <Globe size={18} className="mr-2" />
            웹사이트 방문
          </Link>
        </div>
      </div>
    </div>
  )
}

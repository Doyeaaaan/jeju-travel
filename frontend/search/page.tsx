import Image from "next/image"
import Link from "next/link"
import { destinations } from "@/data/destinations"
import { accommodations } from "@/data/accommodations"
import { restaurants } from "@/data/restaurants"
import SearchBar from "@/components/search-bar"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ""

  // 검색어를 포함하는 항목들을 필터링
  const filteredDestinations = destinations.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  const filteredAccommodations = accommodations.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  const filteredRestaurants = restaurants.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  )

  const hasResults =
    filteredDestinations.length > 0 || filteredAccommodations.length > 0 || filteredRestaurants.length > 0

  return (
    <div className="max-w-4xl mx-auto bg-white pb-8">
      <div className="p-4 border-b flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          재곰제곰
        </Link>
        <div className="flex-1 max-w-md mx-auto">
          <SearchBar />
        </div>
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">"{query}" 검색 결과</h1>

        {!hasResults && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
            <p className="text-gray-500 mt-2">다른 키워드로 검색해 보세요.</p>
          </div>
        )}

        {filteredDestinations.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">관광지 ({filteredDestinations.length})</h2>
              <Link href="/attractions" className="text-sm text-gray-500 hover:underline">
                더보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.slice(0, 3).map((item) => (
                <Link
                  href={`/attractions/${item.id}`}
                  key={item.id}
                  className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                      사진
                    </div>
                    {item.image && (
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover z-20"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredAccommodations.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">숙소 ({filteredAccommodations.length})</h2>
              <Link href="/accommodations" className="text-sm text-gray-500 hover:underline">
                더보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccommodations.slice(0, 3).map((item) => (
                <Link
                  href={`/accommodations/${item.id}`}
                  key={item.id}
                  className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                      사진
                    </div>
                    {item.image && (
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover z-20"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">맛집 ({filteredRestaurants.length})</h2>
              <Link href="/restaurants" className="text-sm text-gray-500 hover:underline">
                더보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRestaurants.slice(0, 3).map((item) => (
                <Link
                  href={`/restaurants/${item.id}`}
                  key={item.id}
                  className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 z-10">
                      사진
                    </div>
                    {item.image && (
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover z-20"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

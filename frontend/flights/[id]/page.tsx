import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Plane, Clock, Calendar, Users, CreditCard, Info } from "lucide-react"

export default function FlightDetailPage({ params }: { params: { id: string } }) {
  // 실제로는 API에서 항공편 정보를 가져올 것입니다
  const flight = {
    id: params.id,
    airline: "대한항공",
    flightNumber: "KE1234",
    departureLocation: "김포 (GMP)",
    arrivalLocation: "제주 (CJU)",
    departureTime: "07:30",
    arrivalTime: "08:40",
    duration: "1시간 10분",
    price: 89000,
    date: "2025-04-15",
    logo: "/placeholder.svg?height=40&width=40",
    aircraft: "Boeing 737-800",
    baggage: "수하물 1개 (15kg)",
    mealIncluded: true,
    refundable: "예약 후 24시간 이내 취소 시 전액 환불",
    departureTerminal: "국내선 1터미널",
    arrivalTerminal: "제주 국내선 터미널",
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`
  }

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen pb-8">
      {/* 헤더 */}
      <div className="p-4 border-b flex items-center">
        <Link href="/flights" className="flex items-center">
          <ArrowLeft size={20} className="mr-2" />
          항공권 목록으로 돌아가기
        </Link>
      </div>

      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">항공권 상세 정보</h1>

        {/* 항공편 요약 */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 relative mr-3">
                <Image src={flight.logo || "/placeholder.svg"} alt={flight.airline} fill className="object-contain" />
              </div>
              <div>
                <div className="font-medium">{flight.airline}</div>
                <div className="text-sm text-gray-500">{flight.flightNumber}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{formatPrice(flight.price)}</div>
              <div className="text-xs text-gray-500">1인당</div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Calendar size={16} className="text-gray-500 mr-2" />
            <span>{formatDate(flight.date)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold">{flight.departureTime}</div>
              <div className="text-sm">{flight.departureLocation.split(" ")[0]}</div>
              <div className="text-xs text-gray-500">{flight.departureTerminal}</div>
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-center">
                <div className="h-0.5 flex-1 bg-gray-300"></div>
                <div className="mx-2">
                  <Plane size={16} className="text-gray-400" />
                </div>
                <div className="h-0.5 flex-1 bg-gray-300"></div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-1">{flight.duration}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{flight.arrivalTime}</div>
              <div className="text-sm">{flight.arrivalLocation.split(" ")[0]}</div>
              <div className="text-xs text-gray-500">{flight.arrivalTerminal}</div>
            </div>
          </div>
        </div>

        {/* 항공편 상세 정보 */}
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-4">항공편 상세 정보</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="text-gray-500">항공사</div>
              <div className="font-medium">{flight.airline}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-500">항공편 번호</div>
              <div className="font-medium">{flight.flightNumber}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-500">항공기</div>
              <div className="font-medium">{flight.aircraft}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-500">수하물</div>
              <div className="font-medium">{flight.baggage}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-500">기내식</div>
              <div className="font-medium">{flight.mealIncluded ? "제공" : "미제공"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-500">환불 정책</div>
              <div className="font-medium">{flight.refundable}</div>
            </div>
          </div>
        </div>

        {/* 예약 정보 */}
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-4">예약 정보</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-2" />
              <div>
                <div className="font-medium">승객</div>
                <div className="text-sm text-gray-500">성인 1명</div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <div>
                <div className="font-medium">소요 시간</div>
                <div className="text-sm text-gray-500">{flight.duration}</div>
              </div>
            </div>

            <div className="flex items-center">
              <CreditCard size={18} className="text-gray-500 mr-2" />
              <div>
                <div className="font-medium">결제 금액</div>
                <div className="text-sm text-gray-500">{formatPrice(flight.price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info size={18} className="text-gray-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium mb-2">예약 전 주의사항</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                <li>항공권 가격은 예고 없이 변경될 수 있습니다.</li>
                <li>예약 완료 후 변경 및 취소 시 수수료가 발생할 수 있습니다.</li>
                <li>체크인은 출발 2시간 전까지 완료해주세요.</li>
                <li>항공사 정책에 따라 수하물 규정이 다를 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 예약 버튼 */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600">예약하기</button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  ChevronDown,
  Users,
  Search,
  ArrowLeftRight,
  Filter,
  Bell,
  BarChart2,
  Info,
  Luggage,
  Coffee,
} from "lucide-react"

export default function FlightsPage() {
  const [activeTab, setActiveTab] = useState<"왕복" | "편도">("왕복")
  const [departureLocation, setDepartureLocation] = useState("제주")
  const [departureCode, setDepartureCode] = useState("CJU")
  const [arrivalLocation, setArrivalLocation] = useState("김포")
  const [arrivalCode, setArrivalCode] = useState("GMP")
  const [departureDate, setDepartureDate] = useState("2025.02.22")
  const [returnDate, setReturnDate] = useState("2025.02.25")
  const [passengers, setPassengers] = useState("성인 1명")
  const [seatClass, setSeatClass] = useState("전체")
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [activeFilterTab, setActiveFilterTab] = useState("항공사")

  // 가상의 항공편 데이터
  const flights = [
    {
      id: 1,
      airline: "제주항공",
      logo: "/placeholder.svg?height=40&width=40",
      departureTime: "21:20",
      arrivalTime: "22:30",
      duration: "01시간 10분",
      price: 58100,
      departureCode: "CJU",
      arrivalCode: "GMP",
      aircraft: "B737-800",
      flightNumber: "7C123",
      baggage: "15kg",
      meal: false,
    },
    {
      id: 2,
      airline: "아시아나항공",
      logo: "/placeholder.svg?height=40&width=40",
      departureTime: "12:00",
      arrivalTime: "13:15",
      duration: "01시간 15분",
      price: 63600,
      departureCode: "CJU",
      arrivalCode: "GMP",
      aircraft: "A321",
      flightNumber: "OZ8901",
      baggage: "20kg",
      meal: true,
    },
    {
      id: 3,
      airline: "티웨이항공",
      logo: "/placeholder.svg?height=40&width=40",
      departureTime: "09:50",
      arrivalTime: "11:00",
      duration: "01시간 10분",
      price: 64700,
      departureCode: "CJU",
      arrivalCode: "GMP",
      aircraft: "B737-800",
      flightNumber: "TW713",
      baggage: "15kg",
      meal: false,
    },
  ]

  const vendors = [
    { name: "와이페이모어", price: 63600, logo: "/placeholder.svg?height=24&width=24" },
    { name: "트리플", price: 63600, logo: "/placeholder.svg?height=24&width=24" },
    { name: "인터파크투어", price: 63600, logo: "/placeholder.svg?height=24&width=24" },
    { name: "트립닷컴", price: 64100, logo: "/placeholder.svg?height=24&width=24" },
    { name: "웹투어", price: 64600, logo: "/placeholder.svg?height=24&width=24" },
  ]

  const swapLocations = () => {
    const tempLocation = departureLocation
    const tempCode = departureCode
    setDepartureLocation(arrivalLocation)
    setDepartureCode(arrivalCode)
    setArrivalLocation(tempLocation)
    setArrivalCode(tempCode)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const handleFlightSelect = (flight) => {
    setSelectedFlight(selectedFlight === flight.id ? null : flight.id)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더와 메뉴 삭제 */}

      {/* 브레드크럼 삭제 */}

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6">
        {/* 검색 패널 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">항공권 검색</h1>

          {/* 왕복/편도 탭 */}
          <div className="flex mb-6 border rounded-md overflow-hidden w-64">
            <button
              className={`flex-1 py-2 text-center ${activeTab === "왕복" ? "bg-black text-white" : "bg-white text-gray-700"}`}
              onClick={() => setActiveTab("왕복")}
            >
              왕복
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === "편도" ? "bg-black text-white" : "bg-white text-gray-700"}`}
              onClick={() => setActiveTab("편도")}
            >
              편도
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 출발지/도착지 */}
            <div className="lg:col-span-1">
              <div className="flex flex-col md:flex-row items-center border rounded-md overflow-hidden">
                <div className="flex-1 p-4 bg-white w-full">
                  <div className="text-xs text-gray-500 mb-1">출발지</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">{departureCode}</div>
                      <div className="text-sm text-gray-600">{departureLocation}</div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center justify-center p-2 md:p-0">
                  <button onClick={swapLocations} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftRight size={20} className="text-black" />
                  </button>
                </div>

                <div className="flex-1 p-4 bg-white w-full">
                  <div className="text-xs text-gray-500 mb-1">도착지</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">{arrivalCode}</div>
                      <div className="text-sm text-gray-600">{arrivalLocation}</div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div className="lg:col-span-1">
              <div className="flex flex-col md:flex-row border rounded-md overflow-hidden">
                <div className="flex-1 p-4 bg-white">
                  <div className="text-xs text-gray-500 mb-1">가는 날</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{departureDate}</div>
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>

                {activeTab === "왕복" && (
                  <div className="flex-1 p-4 bg-white border-t md:border-t-0 md:border-l">
                    <div className="text-xs text-gray-500 mb-1">오는 날</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">{returnDate}</div>
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 승객 및 좌석 등급 */}
            <div className="lg:col-span-1">
              <div className="flex flex-col md:flex-row border rounded-md overflow-hidden">
                <div className="flex-1 p-4 bg-white">
                  <div className="text-xs text-gray-500 mb-1">승객</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{passengers}</div>
                    <Users size={16} className="text-gray-400" />
                  </div>
                </div>

                <div className="flex-1 p-4 bg-white border-t md:border-t-0 md:border-l">
                  <div className="text-xs text-gray-500 mb-1">좌석 등급</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{seatClass}</div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 버튼 복원 */}
          <div className="mt-6 flex justify-end">
            <button className="px-8 py-3 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors flex items-center">
              <Search size={18} className="mr-2" />
              항공권 검색
            </button>
          </div>
        </div>

        {/* 가격 동향 및 알림 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">가격 동향</h2>
              <p className="text-gray-600">최근 60일간의 가격 변동 추이를 확인하세요.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/flights/price-history"
                className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <BarChart2 size={18} className="mr-2" />
                가격 동향 보기
              </Link>
              <button className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Bell size={18} className="mr-2" />
                가격 알림 설정
              </button>
            </div>
          </div>

          {/* 간단한 가격 동향 그래프 */}
          <div className="mt-6 h-32 relative">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              <path
                d="M0,80 C50,70 100,60 150,40 C200,20 250,30 300,20 L400,10"
                fill="none"
                stroke="rgb(0, 0, 0)"
                strokeWidth="2"
              />
              <path
                d="M0,80 C50,70 100,60 150,40 C200,20 250,30 300,20 L400,10 L400,100 L0,100 Z"
                fill="rgba(0, 0, 0, 0.1)"
              />
            </svg>
          </div>
        </div>

        {/* 필터 및 결과 영역 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 필터 사이드바 */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <Filter size={18} className="mr-2" />
                필터
              </h2>

              {/* 필터 탭 */}
              <div className="flex border-b mb-4">
                {["항공사", "가격", "시간", "기타"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-2 text-sm ${activeFilterTab === tab ? "border-b-2 border-black text-black font-medium" : "text-gray-600"}`}
                    onClick={() => setActiveFilterTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeFilterTab === "항공사" && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="all-airlines" className="mr-2" defaultChecked />
                    <label htmlFor="all-airlines" className="text-sm">
                      전체
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="korean-air" className="mr-2" defaultChecked />
                    <label htmlFor="korean-air" className="text-sm">
                      대한항공
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="asiana" className="mr-2" defaultChecked />
                    <label htmlFor="asiana" className="text-sm">
                      아시아나항공
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="jeju-air" className="mr-2" defaultChecked />
                    <label htmlFor="jeju-air" className="text-sm">
                      제주항공
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="jin-air" className="mr-2" />
                    <label htmlFor="jin-air" className="text-sm">
                      진에어
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="t-way" className="mr-2" defaultChecked />
                    <label htmlFor="t-way" className="text-sm">
                      티웨이항공
                    </label>
                  </div>
                </div>
              )}

              {activeFilterTab === "가격" && (
                <div>
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">가격 범위</label>
                    <div className="flex items-center">
                      <input type="text" className="w-24 p-2 border rounded-md text-sm" defaultValue="0" />
                      <span className="mx-2 text-gray-500">~</span>
                      <input type="text" className="w-24 p-2 border rounded-md text-sm" defaultValue="90,000" />
                      <span className="ml-1 text-gray-500">원</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-4 relative">
                    <div className="absolute h-2 bg-black rounded-full" style={{ width: "60%", left: "10%" }}></div>
                    <div
                      className="absolute w-4 h-4 bg-white border-2 border-black rounded-full top-1/2 transform -translate-y-1/2"
                      style={{ left: "10%" }}
                    ></div>
                    <div
                      className="absolute w-4 h-4 bg-white border-2 border-black rounded-full top-1/2 transform -translate-y-1/2"
                      style={{ left: "70%" }}
                    ></div>
                  </div>
                </div>
              )}

              {activeFilterTab === "시간" && (
                <div>
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">출발 시간</label>
                    <div className="grid grid-cols-4 gap-1">
                      {["새벽", "오전", "오후", "저녁"].map((time) => (
                        <button
                          key={time}
                          className="p-2 text-xs border rounded-md hover:bg-gray-50 hover:border-gray-300"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">도착 시간</label>
                    <div className="grid grid-cols-4 gap-1">
                      {["새벽", "오전", "오후", "저녁"].map((time) => (
                        <button
                          key={time}
                          className="p-2 text-xs border rounded-md hover:bg-gray-50 hover:border-gray-300"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeFilterTab === "기타" && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="direct-flight" className="mr-2" defaultChecked />
                    <label htmlFor="direct-flight" className="text-sm">
                      직항만
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="with-meal" className="mr-2" />
                    <label htmlFor="with-meal" className="text-sm">
                      기내식 제공
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="refundable" className="mr-2" />
                    <label htmlFor="refundable" className="text-sm">
                      환불 가능
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <button className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                  필터 적용
                </button>
                <button className="w-full py-2 mt-2 text-gray-600 hover:text-black text-sm">필터 초기화</button>
              </div>
            </div>
          </div>

          {/* 항공편 목록 */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {departureCode} → {arrivalCode}
                </h2>
                <div className="text-sm text-gray-500">
                  {departureDate} • {passengers}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">총 {flights.length}개의 항공편이 검색되었습니다.</div>
            </div>

            {/* 정렬 옵션 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 text-sm bg-black text-white rounded-md">최저가순</button>
                <button className="px-3 py-1 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50">
                  출발 시간순
                </button>
                <button className="px-3 py-1 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50">
                  도착 시간순
                </button>
                <button className="px-3 py-1 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50">
                  비행 시간순
                </button>
              </div>
            </div>

            {/* 항공편 카드 */}
            {flights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative mr-3">
                        <Image src={flight.logo || "/placeholder.svg"} alt={flight.airline} width={40} height={40} />
                      </div>
                      <div>
                        <div className="font-bold">{flight.airline}</div>
                        <div className="text-xs text-gray-500">
                          {flight.flightNumber} • {flight.aircraft}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">편도</div>
                      <div className="font-bold text-xl text-black">{formatPrice(flight.price)}</div>
                      <div className="text-xs text-gray-500">1인당</div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{flight.departureTime}</div>
                      <div className="text-sm text-gray-500">{flight.departureCode}</div>
                    </div>

                    <div className="flex-1 px-4">
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                        <div className="w-full h-0.5 bg-gray-300 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">직항</div>
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="text-2xl font-bold">{flight.arrivalTime}</div>
                      <div className="text-sm text-gray-500">{flight.arrivalCode}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Luggage size={16} className="mr-1" />
                        <span>수하물 {flight.baggage}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Coffee size={16} className="mr-1" />
                        <span>{flight.meal ? "기내식 제공" : "기내식 없음"}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        className="px-2 py-1 text-sm text-black border border-black rounded hover:bg-gray-50"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        상세 정보
                      </button>
                      <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">예약하기</button>
                    </div>
                  </div>
                </div>

                {/* 확장된 상세 정보 */}
                {selectedFlight === flight.id && (
                  <div className="bg-gray-50 p-4 border-t">
                    <div className="mb-4">
                      <h3 className="font-bold mb-2 flex items-center">
                        <Info size={16} className="mr-1" />
                        항공편 상세 정보
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs text-gray-500">항공기</div>
                          <div className="font-medium">{flight.aircraft}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs text-gray-500">항공편 번호</div>
                          <div className="font-medium">{flight.flightNumber}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs text-gray-500">비행 시간</div>
                          <div className="font-medium">{flight.duration}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold mb-2">판매처 비교</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {vendors.map((vendor, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div className="flex items-center">
                              <div className="w-6 h-6 relative mr-2">
                                <Image
                                  src={vendor.logo || "/placeholder.svg"}
                                  alt={vendor.name}
                                  width={24}
                                  height={24}
                                />
                              </div>
                              <div>{vendor.name}</div>
                            </div>
                            <div className="flex items-center">
                              <div className="font-bold text-black mr-3">{formatPrice(vendor.price)}</div>
                              <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">
                                예매
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">운임 규정</h3>
                      <div className="bg-white p-3 rounded border text-sm">
                        <p className="mb-2">
                          <span className="font-medium">변경:</span> 출발 전 1회 무료 변경 가능, 이후 10,000원의 수수료
                          발생
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">취소:</span> 출발 3일 전까지 90% 환불, 이후 70% 환불
                        </p>
                        <p>
                          <span className="font-medium">노쇼:</span> 환불 불가
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-6">
              <div className="flex space-x-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-black text-white">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">4</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">5</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">...</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-black text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">재곰제곰</h3>
              <p className="text-gray-400 text-sm">제주도 여행을 위한 최고의 여행 플랫폼</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/flights" className="hover:text-white">
                    항공권
                  </Link>
                </li>
                <li>
                  <Link href="/accommodations" className="hover:text-white">
                    숙소
                  </Link>
                </li>
                <li>
                  <Link href="/attractions" className="hover:text-white">
                    관광지
                  </Link>
                </li>
                <li>
                  <Link href="/restaurants" className="hover:text-white">
                    맛집
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">고객 지원</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    고객센터
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">연락처</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>이메일: contact@example.com</li>
                <li>전화: 02-123-4567</li>
                <li>주소: 제주특별자치도 제주시</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            © 2025 재곰제곰. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

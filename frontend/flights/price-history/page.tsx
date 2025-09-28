"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react"

export default function PriceHistoryPage() {
  // 과거 60일 가격 데이터 생성 (실제로는 API에서 가져올 것)
  const generatePriceData = () => {
    const data = []
    const basePrice = 70000

    for (let i = 0; i < 60; i++) {
      // 랜덤 가격 변동 (50000원 ~ 100000원 사이)
      let price = basePrice + Math.floor(Math.random() * 50000) - 25000

      // 특정 날짜에 높은 가격 스파이크 생성
      if (i === 22) {
        price = 120000
      }

      // 최소 가격 보장
      price = Math.max(price, 50000)

      const date = new Date()
      date.setDate(date.getDate() - 60 + i)

      data.push({
        date: date.toISOString().split("T")[0],
        price: price,
        formattedDate: `${date.getMonth() + 1}월 ${date.getDate()}일`,
        dayOfWeek: ["일", "월", "화", "수", "목", "금", "토"][date.getDay()],
      })
    }

    return data
  }

  const [priceData] = useState(generatePriceData())
  const [selectedDay, setSelectedDay] = useState(22)
  const [viewMode, setViewMode] = useState("일별")

  // 월별로 데이터 그룹화
  const groupByMonth = () => {
    const grouped = {}

    priceData.forEach((item) => {
      const month = item.date.substring(5, 7)
      if (!grouped[month]) {
        grouped[month] = []
      }
      grouped[month].push(item)
    })

    return grouped
  }

  const monthlyData = groupByMonth()
  const months = Object.keys(monthlyData).sort()

  // 최저가 계산
  const minPrice = Math.min(...priceData.map((d) => d.price))
  const minPriceDate = priceData.find((d) => d.price === minPrice)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            재곰제곰
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              로그인
            </Link>
            <Link href="/mypage" className="text-gray-600 hover:text-blue-600">
              마이페이지
            </Link>
            <Link href="/schedules" className="text-gray-600 hover:text-blue-600">
              여행 계획
            </Link>
          </nav>
        </div>
      </header>

      {/* 브레드크럼 */}
      <div className="container mx-auto px-4 py-2 text-sm text-gray-500">
        <div className="flex items-center">
          <Link href="/" className="hover:text-blue-600">
            홈
          </Link>
          <ChevronDown size={14} className="mx-1 transform rotate-270" />
          <Link href="/flights" className="hover:text-blue-600">
            항공권 검색
          </Link>
          <ChevronDown size={14} className="mx-1 transform rotate-270" />
          <span className="text-gray-700">가격 동향</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/flights" className="mr-4">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">항공권 가격 동향</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">제주 → 김포</h2>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-1" />
                <span>2025.02.22 (토)</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-md">
                <div className="text-xs text-gray-500">최저가</div>
                <div className="text-lg font-bold text-blue-600">₩{minPrice.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {minPriceDate?.formattedDate} ({minPriceDate?.dayOfWeek})
                </div>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-md">
                <div className="text-xs text-gray-500">현재 선택</div>
                <div className="text-lg font-bold text-blue-600">₩{priceData[selectedDay].price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {priceData[selectedDay].formattedDate} ({priceData[selectedDay].dayOfWeek})
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium ${viewMode === "일별" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} rounded-l-md border`}
                onClick={() => setViewMode("일별")}
              >
                일별
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${viewMode === "주별" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r`}
                onClick={() => setViewMode("주별")}
              >
                주별
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${viewMode === "월별" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} rounded-r-md border-t border-b border-r`}
                onClick={() => setViewMode("월별")}
              >
                월별
              </button>
            </div>
          </div>

          <div className="h-80 relative">
            <div className="absolute inset-0">
              <div className="h-full flex items-end">
                {priceData.map((item, index) => {
                  const height = (item.price / 120000) * 100
                  return (
                    <div
                      key={index}
                      className={`flex-1 flex flex-col items-center ${index === selectedDay ? "bg-blue-100" : ""}`}
                      style={{ height: "100%" }}
                      onClick={() => setSelectedDay(index)}
                    >
                      <div
                        className={`w-full ${index === selectedDay ? "bg-blue-600" : "bg-blue-400"}`}
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-sm text-gray-500">
            {months.map((month) => (
              <span key={month}>{Number.parseInt(month)}월</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">날짜별 가격 정보</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    날짜
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    요일
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    최저가
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    항공사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceData.slice(Math.max(0, selectedDay - 3), selectedDay + 4).map((item, index) => (
                  <tr key={index} className={selectedDay === index + Math.max(0, selectedDay - 3) ? "bg-blue-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.formattedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dayOfWeek}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      ₩{item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">다양한 항공사</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        예약하기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">가격 동향 분석</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">최저가 시기</h3>
              <p className="text-gray-600 text-sm">
                최근 60일 중 가장 저렴한 시기는{" "}
                <span className="font-bold">
                  {minPriceDate?.formattedDate} ({minPriceDate?.dayOfWeek})
                </span>
                로, 가격은 <span className="font-bold text-blue-600">₩{minPrice.toLocaleString()}</span>입니다.
              </p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">가격 변동 추이</h3>
              <p className="text-gray-600 text-sm">
                최근 30일간 가격이 평균 <span className="font-bold text-red-600">12%</span> 상승했습니다. 빠른 시일 내에
                예약하는 것이 유리할 수 있습니다.
              </p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">예상 가격 변동</h3>
              <p className="text-gray-600 text-sm">
                향후 2주간 가격이 <span className="font-bold text-red-600">상승</span>할 것으로 예상됩니다. 지금
                예약하는 것이 좋습니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
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

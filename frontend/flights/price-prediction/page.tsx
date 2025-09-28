"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronRight,
  BarChart2,
  Bell,
  Search,
} from "lucide-react"

export default function PricePredictionPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("14days")

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
          <ChevronRight size={14} className="mx-1" />
          <Link href="/flights" className="hover:text-blue-600">
            항공권 검색
          </Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-gray-700">가격 예측</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/flights" className="mr-4">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">항공권 가격 예측</h1>
        </div>

        {/* 여정 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">제주 (CJU) → 김포 (GMP)</h2>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-1" />
                <span>2025.02.22 (토)</span>
              </div>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-md flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              <div>
                <div className="text-sm font-medium">가격 상승 예상</div>
                <div className="text-xs text-gray-500">지금 예약하는 것이 좋습니다</div>
              </div>
            </div>
          </div>

          {/* 현재 가격 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">현재 최저가</div>
              <div className="text-2xl font-bold text-blue-600">₩63,600</div>
              <div className="text-sm text-gray-500">아시아나항공</div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">평균 가격</div>
              <div className="text-2xl font-bold">₩72,800</div>
              <div className="text-sm text-gray-500">지난 30일 기준</div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">최저가 대비</div>
              <div className="text-2xl font-bold text-green-600">-12.6%</div>
              <div className="text-sm text-gray-500">평균 대비 저렴</div>
            </div>
          </div>
        </div>

        {/* 가격 예측 그래프 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold">가격 예측 그래프</h2>
            <div className="mt-4 md:mt-0 flex">
              <button
                className={`px-4 py-2 text-sm ${selectedTimeframe === "7days" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} rounded-l-md`}
                onClick={() => setSelectedTimeframe("7days")}
              >
                7일
              </button>
              <button
                className={`px-4 py-2 text-sm ${selectedTimeframe === "14days" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setSelectedTimeframe("14days")}
              >
                14일
              </button>
              <button
                className={`px-4 py-2 text-sm ${selectedTimeframe === "30days" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} rounded-r-md`}
                onClick={() => setSelectedTimeframe("30days")}
              >
                30일
              </button>
            </div>
          </div>

          <div className="bg-white p-4 border rounded-lg mb-6">
            <div className="h-96 relative">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* 그리드 라인 */}
                <g className="grid-lines">
                  <line x1="50" y1="350" x2="750" y2="350" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="50" y1="280" x2="750" y2="280" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="210" x2="750" y2="210" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="140" x2="750" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="70" x2="750" y2="70" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />

                  <line x1="50" y1="50" x2="50" y2="350" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="190" y1="50" x2="190" y2="350" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="330" y1="50" x2="330" y2="350" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="470" y1="50" x2="470" y2="350" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="610" y1="50" x2="610" y2="350" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="750" y1="50" x2="750" y2="350" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                </g>

                {/* Y축 레이블 */}
                <g className="y-axis-labels">
                  <text x="40" y="350" fontSize="12" textAnchor="end" fill="#6b7280">
                    ₩50,000
                  </text>
                  <text x="40" y="280" fontSize="12" textAnchor="end" fill="#6b7280">
                    ₩60,000
                  </text>
                  <text x="40" y="210" fontSize="12" textAnchor="end" fill="#6b7280">
                    ₩70,000
                  </text>
                  <text x="40" y="140" fontSize="12" textAnchor="end" fill="#6b7280">
                    ₩80,000
                  </text>
                  <text x="40" y="70" fontSize="12" textAnchor="end" fill="#6b7280">
                    ₩90,000
                  </text>
                </g>

                {/* X축 레이블 */}
                <g className="x-axis-labels">
                  <text x="50" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    2/22
                  </text>
                  <text x="190" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    2/25
                  </text>
                  <text x="330" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    2/28
                  </text>
                  <text x="470" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    3/3
                  </text>
                  <text x="610" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    3/6
                  </text>
                  <text x="750" y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                    3/9
                  </text>
                </g>

                {/* 실제 데이터 곡선 */}
                <path d="M50,300 C70,290 90,280 110,270 L110,270" fill="none" stroke="#2563eb" strokeWidth="3" />

                {/* 예측 곡선 */}
                <path
                  d="M110,270 C150,250 200,200 250,170 S350,130 450,110 S550,90 650,70 S700,60 750,50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />

                {/* 현재 지점 표시 */}
                <circle cx="110" cy="270" r="6" fill="#2563eb" />

                {/* 구분선 */}
                <line x1="110" y1="50" x2="110" y2="350" stroke="#6b7280" strokeWidth="1" strokeDasharray="5,5" />
                <text x="110" y="40" fontSize="12" textAnchor="middle" fill="#6b7280">
                  현재
                </text>

                {/* 범례 */}
                <rect x="600" y="30" width="15" height="3" fill="#2563eb" />
                <text x="620" y="33" fontSize="12" fill="#6b7280">
                  실제 가격
                </text>

                <rect x="600" y="50" width="15" height="3" fill="#ef4444" />
                <text x="620" y="53" fontSize="12" fill="#6b7280">
                  예측 가격
                </text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border rounded-md p-4 bg-blue-50">
              <div className="flex items-center mb-2">
                <TrendingUp size={20} className="text-red-500 mr-2" />
                <h3 className="font-bold">내일 가격 예측</h3>
              </div>
              <p className="text-gray-600 text-sm">
                내일 가격이 <span className="font-bold text-red-600">5% 상승</span>할 것으로 예측됩니다.
              </p>
              <div className="mt-2 text-sm font-medium text-red-600">₩63,600 → ₩66,780</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-2">
                <TrendingUp size={20} className="text-red-500 mr-2" />
                <h3 className="font-bold">7일 후 가격 예측</h3>
              </div>
              <p className="text-gray-600 text-sm">
                7일 후 가격이 <span className="font-bold text-red-600">15% 상승</span>할 것으로 예측됩니다.
              </p>
              <div className="mt-2 text-sm font-medium text-red-600">₩63,600 → ₩73,140</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-2">
                <TrendingDown size={20} className="text-green-500 mr-2" />
                <h3 className="font-bold">14일 후 가격 예측</h3>
              </div>
              <p className="text-gray-600 text-sm">
                14일 후 가격이 <span className="font-bold text-green-600">8% 하락</span>할 것으로 예측됩니다.
              </p>
              <div className="mt-2 text-sm font-medium text-green-600">₩63,600 → ₩58,512</div>
            </div>
          </div>
        </div>

        {/* 예측 분석 및 추천 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">가격 예측 분석</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">가격 동향 요약</h3>
                  <p className="text-gray-700">
                    제주-김포 노선의 항공권 가격은 현재 평균보다 낮은 수준이지만, 향후 2주간 지속적으로 상승할 것으로
                    예측됩니다. 특히 설 연휴가 다가오면서 2월 말부터 3월 초까지 가격이 최대 25% 상승할 것으로 보입니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">가격 변동 요인</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>설 연휴 기간 수요 증가</li>
                    <li>유류 할증료 인상 예정 (3월 1일부터)</li>
                    <li>현재 좌석 점유율 75% (빠르게 증가 중)</li>
                    <li>항공사 프로모션 종료 예정 (2월 25일)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">항공사별 가격 비교</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            현재 가격
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            7일 후 예상
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            변동률
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">대한항공</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩78,900</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩89,500</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+13.4%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            아시아나항공
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩63,600</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩73,140</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+15.0%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">제주항공</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩58,100</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩68,500</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+17.9%</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">티웨이항공</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩64,700</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩72,500</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+12.1%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">예약 추천</h2>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-red-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-700">지금 예약 권장</h3>
                    <p className="text-sm text-red-600 mt-1">
                      현재 가격이 평균보다 낮고, 향후 2주간 지속적인 가격 상승이 예상됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">현재 가격은 최근 30일 중 하위 25%에 속합니다.</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">7일 내 가격이 15% 이상 상승할 확률이 85%입니다.</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">남은 좌석이 25% 미만으로 빠르게 감소 중입니다.</span>
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Search className="mr-2 h-5 w-5" />
                  항공권 검색하기
                </button>
                <button className="w-full mt-3 py-3 border border-blue-600 text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <Bell className="mr-2 h-5 w-5" />
                  가격 알림 설정하기
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">가격 동향 보기</h2>
              <div className="space-y-3">
                <Link href="/flights/price-history" className="flex items-center text-blue-600 hover:text-blue-800">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  <span>최근 60일 가격 동향</span>
                </Link>
                <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>월별 가격 달력</span>
                </Link>
                <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <Info className="mr-2 h-5 w-5" />
                  <span>가격 예측 방법론</span>
                </Link>
              </div>
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

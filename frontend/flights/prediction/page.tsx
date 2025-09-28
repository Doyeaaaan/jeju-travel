"use client"
import Link from "next/link"
import { ArrowLeft, ChevronDown, Calendar, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"


export default function PricePredictionPage() {
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">제주 → 김포</h2>
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

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">향후 14일간 가격 예측</h3>
            <div className="h-80 relative">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* 그리드 라인 */}
                <line x1="50" y1="20" x2="50" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="50" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="50" y1="20" x2="380" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="60" x2="380" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="140" x2="380" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />

                <line x1="120" y1="20" x2="120" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="190" y1="20" x2="190" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="260" y1="20" x2="260" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="330" y1="20" x2="330" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />

                {/* Y축 레이블 */}
                <text x="40" y="25" fontSize="12" textAnchor="end" fill="#6b7280">
                  ₩100,000
                </text>
                <text x="40" y="65" fontSize="12" textAnchor="end" fill="#6b7280">
                  ₩90,000
                </text>
                <text x="40" y="105" fontSize="12" textAnchor="end" fill="#6b7280">
                  ₩80,000
                </text>
                <text x="40" y="145" fontSize="12" textAnchor="end" fill="#6b7280">
                  ₩70,000
                </text>
                <text x="40" y="185" fontSize="12" textAnchor="end" fill="#6b7280">
                  ₩60,000
                </text>

                {/* 실제 데이터 곡선 */}
                <path d="M50,150 C70,145 90,140 110,135" fill="none" stroke="#2563eb" strokeWidth="3" />

                {/* 예측 곡선 */}
                <path
                  d="M110,135 C150,120 200,90 250,70 S300,50 380,30"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />

                {/* 현재 지점 표시 */}
                <circle cx="110" cy="135" r="6" fill="#2563eb" />

                {/* 구분선 */}
                <line x1="110" y1="20" x2="110" y2="180" stroke="#6b7280" strokeWidth="1" strokeDasharray="5,5" />
                <text x="110" y="195" fontSize="12" textAnchor="middle" fill="#6b7280">
                  현재
                </text>

                {/* X축 레이블 */}
                <text x="50" y="195" fontSize="12" textAnchor="middle" fill="#6b7280">
                  2/22
                </text>
                <text x="190" y="195" fontSize="12" textAnchor="middle" fill="#6b7280">
                  2/26
                </text>
                <text x="330" y="195" fontSize="12" textAnchor="middle" fill="#6b7280">
                  3/2
                </text>

                {/* 범례 */}
                <rect x="280" y="20" width="12" height="3" fill="#2563eb" />
                <text x="300" y="23" fontSize="10" fill="#6b7280">
                  실제 가격
                </text>

                <rect x="280" y="35" width="12" height="3" fill="#ef4444" />
                <text x="300" y="38" fontSize="10" fill="#6b7280">
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
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Car, Train } from "lucide-react"

export default function PlanningStep6Page() {
  const router = useRouter()
  const [transportMode, setTransportMode] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user?.email) {
      alert("로그인이 필요합니다.")
      router.replace("/login")
    } else {
      setUserEmail(user.email)
      const storedTransport = localStorage.getItem(`transportMode-${user.email}`)
      if (storedTransport) {
        setTransportMode(storedTransport)
      }
    }
  }, [router])

  const handleNext = () => {
    if (transportMode && userEmail) {
      localStorage.setItem(`transportMode-${userEmail}`, transportMode)
      router.push("/planning/schedule/complete")
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="p-4 border-b flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">제공제공</Link>
        <div className="flex items-center gap-4">
          <Link href="/mypage" className="text-sm">마이페이지</Link>
          <Link href="/login" className="text-sm">로그인</Link>
        </div>
      </div>

      {/* 진행 상태 */}
      <div className="bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {["여행 기간", "여행 스타일", "장소 선택", "일정 확인"].map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Check size={16} />
                </div>
                <span className="text-xs mt-1 font-medium">{step}</span>
                {i < 3 && <div className="flex-1 h-1 bg-orange-500 mx-2 w-full" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-8 max-w-2xl mx-auto">
        <Link href="/planning/schedule/step5" className="flex items-center text-gray-500 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          이전 단계
        </Link>

        <h1 className="text-2xl font-bold mb-8">이동수단 선택</h1>
        <p className="text-gray-600 mb-8">여행 시 이용하실 이동수단을 선택해주세요.</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <TransportOption
            label="대중교통"
            value="public"
            icon={<Train size={32} className="text-gray-600" />}
            description="버스, 택시 등 대중교통을 이용합니다."
            selected={transportMode === "public"}
            onClick={() => setTransportMode("public")}
          />
          <TransportOption
            label="승용차"
            value="car"
            icon={<Car size={32} className="text-white" />}
            description="택시나 자가용, 렌트카 등을 이용합니다."
            selected={transportMode === "car"}
            onClick={() => setTransportMode("car")}
          />
        </div>

        <div className="bg-orange-50 rounded-lg p-4 mb-8">
          <h3 className="font-bold mb-2">이동수단 팁</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>제주도는 대중교통이 다소 불편할 수 있어 렌트카를 추천합니다.</li>
            <li>렌트카를 이용하면 더 자유롭게 여행할 수 있습니다.</li>
            <li>대중교통을 이용할 경우 버스 노선과 시간표를 미리 확인하세요.</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Link href="/planning/schedule/step5" className="px-6 py-2 border rounded-md">이전</Link>
          <button
            onClick={handleNext}
            disabled={!transportMode}
            className={`px-6 py-2 rounded-md ${
              transportMode ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            일정 생성하기
          </button>
        </div>
      </div>
    </div>
  )
}

function TransportOption({ label, value, icon, description, selected, onClick }: {
  label: string, value: string, icon: React.ReactNode, description: string, selected: boolean, onClick: () => void
}) {
  return (
    <div
      className={`p-6 border rounded-lg cursor-pointer transition-all flex flex-col items-center ${
        selected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
      }`}
      onClick={onClick}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        value === "car" ? "bg-black" : "bg-gray-100"
      }`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{label}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  )
}

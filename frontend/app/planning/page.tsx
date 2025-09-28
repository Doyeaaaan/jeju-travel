import Link from "next/link";
import {
  ChevronLeft,
  CalendarRange,
  BedDouble,
  MapPin,
  CheckCircle2,
  Tags,
  Route,
} from "lucide-react";

export default function PlanningPage() {
  return (
    <div className="max-w-full mx-auto bg-white min-h-screen">
      <div className="p-5">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={20} className="mr-1" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto p-6 mt-6 md:mt-10 lg:mt-12">
        <h1 className="text-3xl font-bold text-center mb-4">
          나만의 제주도 여행 계획 만들기
        </h1>
        <p className="text-center text-gray-600 mb-8">
          날짜 선택부터 숙소, 관광지, 맛집까지 한 번에 계획하고 멋진 여행을
          떠나보세요!
        </p>

        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* 카드 1: 여행 계획 세우기 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-amber-700 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-orange-900">
                여행 계획 세우기
              </h2>
              <p className="text-orange-700 mb-6">
                날짜 선택부터 숙소, 관광지, 맛집까지 단계별로 선택하여
                <br />
                나만의 맞춤 여행 일정을 만들어보세요.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CalendarRange size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">
                    여행 날짜 선택
                  </span>
                </div>

                <div className="flex items-center">
                  <BedDouble size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">숙소 선택</span>
                </div>

                <div className="flex items-center">
                  <span className="text-orange-500 mr-3 flex items-center">
                    <MapPin size={24} />
                  </span>
                  <span className="text-lg text-orange-800">
                    관광지 / 맛집 선택
                  </span>
                </div>

                <div className="flex items-center">
                  <CheckCircle2 size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">일정 확정</span>
                </div>
              </div>
            </div>

            <Link
              href="/planning/flow/date-selection"
              className="block w-full py-4 bg-orange-400 text-white text-center rounded-xl font-medium hover:bg-orange-500 transition-colors text-lg"
            >
              여행 계획 세우기
            </Link>
          </div>

          {/* 카드 2: 키워드 여행 플래너 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-amber-700 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-orange-900">
                키워드 여행 플래너
              </h2>
              <p className="text-orange-700 mb-6">
                키워드를 선택하시면 최적의 제주도 여행 일정을 추천해드립니다.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CalendarRange size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">
                    여행 날짜 입력
                  </span>
                </div>
                <div className="flex items-center">
                  <Tags size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">키워드 선택</span>
                </div>
                <div className="flex items-center">
                  <Route size={24} className="text-orange-500 mr-3" />
                  <span className="text-lg text-orange-800">
                    여행 일정 완성
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/planning/ai"
              className="block w-full py-4 bg-orange-400 text-white text-center rounded-xl font-medium hover:bg-orange-500 transition-colors text-lg"
            >
              키워드 여행 플래너 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

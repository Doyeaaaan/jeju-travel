"use client";
export default function TripList() {
  return (
    <div className="space-y-4">
      {/* Trip Card 1 */}
      <div className="border rounded-md overflow-hidden">
        <div className="flex">
          <div className="w-1/3 relative">
            <div className="h-32 flex items-center justify-center bg-gray-200 text-gray-500">
              사진
            </div>
          </div>
          <div className="w-2/3 p-4">
            <h3 className="font-bold">제주 동부 3일 완벽 코스</h3>
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              성산일출봉 오름, 산방산과 바다를 등 제주 동부의 아름다운 명소들을
              3일 동안 효율적으로 둘러볼 수 있는 코스입니다.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                # 성산일출봉
              </span>
              <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                # 우도
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Card 2 */}
      <div className="border rounded-md overflow-hidden">
        <div className="flex">
          <div className="w-1/3 relative">
            <div className="h-32 flex items-center justify-center bg-gray-200 text-gray-500">
              사진
            </div>
          </div>
          <div className="w-2/3 p-4">
            <h3 className="font-bold">제주 서부 2일 힐링 코스</h3>
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              한림공원, 협재 해변 등 제주 서부의 아름다운 자연을 즐기는 힐링
              여행 코스입니다.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                # 협재해변
              </span>
              <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                # 한림공원
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

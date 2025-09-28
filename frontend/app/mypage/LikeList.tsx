"use client";
export default function LikeList() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border rounded-md overflow-hidden">
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          사진
        </div>
        <div className="p-3">
          <h3 className="font-bold">성산일출봉</h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-yellow-500">★★★★★</span>
            <span className="text-xs text-gray-500 ml-1">(1,243)</span>
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          사진
        </div>
        <div className="p-3">
          <h3 className="font-bold">제주 한옥 스테이</h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-yellow-500">★★★★★</span>
            <span className="text-xs text-gray-500 ml-1">(287)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

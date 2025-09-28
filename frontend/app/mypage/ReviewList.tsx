"use client";
export default function ReviewList() {
  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <div className="flex justify-between">
          <h3 className="font-bold">성산일출봉</h3>
          <div className="flex text-yellow-500">★★★★★</div>
        </div>
        <p className="text-sm mt-2">
          정말 아름다운 곳이에요! 일출을 보기 위해 새벽에 방문했는데, 그 광경은
          정말 잊을 수 없을 거예요.
        </p>
        <div className="mt-2 flex gap-2">
          <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
          <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">2023년 10월 15일</p>
      </div>

      <div className="border rounded-md p-4">
        <div className="flex justify-between">
          <h3 className="font-bold">우도</h3>
          <div className="flex text-yellow-500">★★★★☆</div>
        </div>
        <p className="text-sm mt-2">
          페리를 타고 가는 것부터 색다른 경험이었어요. 섬 전체를 자전거로
          돌아보는 것을 추천합니다!
        </p>
        <p className="text-xs text-gray-500 mt-2">2023년 9월 22일</p>
      </div>
    </div>
  );
}

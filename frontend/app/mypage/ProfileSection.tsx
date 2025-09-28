"use client";
import Image from "next/image";

interface ProfileSectionProps {
  nickname: string;
  profileImage: string;
  onEdit: () => void;
}

export default function ProfileSection({
  nickname,
  profileImage,
  onEdit,
}: ProfileSectionProps) {
  return (
    <div className="pt-16 px-6">
      <h1 className="text-2xl font-bold">{nickname}</h1>
      <p className="text-gray-500 mt-1">제주도 여행 마니아 | 방문 횟수: 12회</p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
        >
          프로필 수정
        </button>
      </div>
    </div>
  );
}

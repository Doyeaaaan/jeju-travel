"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import ProfileDisplay from "@/components/ProfileDisplay";

export default function ProfileDropdown() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // ✅ 로그인 안 했을 경우 "로그인" 버튼 표시
  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm text-gray-600 hover:text-black border px-3 py-1.5 rounded-full"
      >
        로그인
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center focus:outline-none hover:bg-gray-50 rounded-lg p-1 transition-colors">
          <ProfileDisplay 
            showNickname={true} 
            size="md" 
            autoRefresh={true}
            refreshInterval={30000}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mt-2">
        <DropdownMenuItem asChild>
          <Link href="/mypage">마이페이지</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/community">제공제공 게시판</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/friends">친구 목록</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile/settings">프로필 설정</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

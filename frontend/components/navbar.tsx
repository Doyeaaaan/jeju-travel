"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, LogOut, Calendar, Users, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, authLoading, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navItems = [
    { name: "홈", href: "/" },
    { name: "여행지", href: "/attractions" },
    { name: "숙소", href: "/accommodations" },
    { name: "맛집", href: "/restaurants" },
    { name: "일정계획", href: "/planning" },
    { name: "커뮤니티", href: "/community" },
  ]

  const handleWritePost = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    router.push("/community/write")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/jegom.png" alt="재곰제곰" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">재곰제곰</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  pathname === item.href ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {pathname === "/community" && (
              <Button
                onClick={handleWritePost}
                variant="outline"
                size="sm"
                className="text-sm font-medium border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors bg-transparent"
              >
                <Edit className="w-4 h-4 mr-1" />
                글쓰기
              </Button>
            )}
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {authLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-auto p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.nickname} />
                        <AvatarFallback>{user.nickname?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {user.nickname || user.email?.split("@")[0] || "사용자"}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.nickname || user.email?.split("@")[0] || "사용자"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/mypage" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-itinerary" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />내 일정
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/friends" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      친구
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="메뉴 열기">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* 모바일에서 사용자 정보 표시 */}
              {isAuthenticated && user && (
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.nickname} />
                      <AvatarFallback>{user.nickname?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {user.nickname || user.email?.split("@")[0] || "사용자"}
                      </span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-600 ${
                    pathname === item.href ? "text-orange-600" : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {pathname === "/community" && (
                <button
                  onClick={() => {
                    handleWritePost()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  글쓰기
                </button>
              )}

              {/* 모바일에서 로그아웃 버튼 */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

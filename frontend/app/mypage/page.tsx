"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Heart, MessageSquare, Users, Calendar, Settings, UserPlus, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/auth-service"
import { friendService } from "@/lib/friend-service"
import { userService } from "@/lib/user-service"
import type { MypageResponseDto, UserDto } from "@/types/api-types"
import type { Friend, FriendRequest } from "@/lib/friend-service"
import WithdrawalDialog from "./WithdrawalDialog"

export default function MyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, authLoading, updateUser, logout, refreshToken } = useAuth()


  const [mypageData, setMypageData] = useState<MypageResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false)
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)
  const [newNickname, setNewNickname] = useState("")
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)

  // 친구 요청 관련 상태
  const [friendEmail, setFriendEmail] = useState("")
  const [searchedUser, setSearchedUser] = useState<UserDto | null>(null)
  const [searching, setSearching] = useState(false)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])

  // 마이페이지 데이터 로드
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadMypageData()
        loadFriendData()
      } else {
        router.push("/login")
      }
    }
  }, [authLoading, isAuthenticated, router])

  // 인증 상태에 따른 렌더링
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">인증 상태를 확인하는 중...</p>
          <p className="text-sm text-gray-500 mb-4">인증이 완료되지 않아 친구 목록을 불러올 수 없습니다.</p>
          <button
            onClick={() => {
              const tokenStatus = {
                accessToken: localStorage.getItem("accessToken") ? "존재함" : "없음",
                refreshToken: localStorage.getItem("refreshToken") ? "존재함" : "없음",
                user: localStorage.getItem("user"),
              }

              if (tokenStatus.accessToken === "없음") {
                alert("토큰이 없습니다. 로그인이 필요합니다.")
                router.push("/login")
              } else {
                alert("토큰이 존재합니다. 페이지를 새로고침합니다.")
                window.location.reload()
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            인증 상태 확인
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              alert("모든 데이터를 삭제했습니다. 로그인 페이지로 이동합니다.")
              router.push("/login")
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            데이터 초기화
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  const loadMypageData = async () => {
    try {
      setLoading(true)
      const response = await userService.getMypage()


      if (response.data) {
        // 즐겨찾기 데이터 하드코딩 추가
        const hardcodedFavorites = [
          {
            id: 1,
            placeName: "성산일출봉",
            placeAddress: "제주특별자치도 서귀포시 성산읍 성산리",
            placeCategory: "관광지",
            createdAt: new Date().toISOString(),
            placeId: "CNTS_001"
          },
          {
            id: 2,
            placeName: "협재해수욕장",
            placeAddress: "제주특별자치도 제주시 한림읍 협재리",
            placeCategory: "관광지",
            createdAt: new Date().toISOString(),
            placeId: "CNTS_002"
          },
          {
            id: 3,
            placeName: "제주 흑돼지 맛집",
            placeAddress: "제주특별자치도 제주시 연동",
            placeCategory: "맛집",
            createdAt: new Date().toISOString(),
            placeId: "CNTS_003"
          },
          {
            id: 4,
            placeName: "제주 리조트",
            placeAddress: "제주특별자치도 서귀포시 중문관광단지",
            placeCategory: "숙소",
            createdAt: new Date().toISOString(),
            placeId: "CNTS_004"
          },
          {
            id: 5,
            placeName: "한라산 국립공원",
            placeAddress: "제주특별자치도 제주시 해안동",
            placeCategory: "관광지",
            createdAt: new Date().toISOString(),
            placeId: "CNTS_005"
          }
        ]

        // localStorage에서 사용자가 추가한 즐겨찾기 가져오기
        const userFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        
        // 하드코딩된 즐겨찾기와 사용자 즐겨찾기 합치기
        const allFavorites = [...hardcodedFavorites, ...userFavorites];

        const updatedData = {
          ...response.data,
          favorites: allFavorites
        }

        setMypageData(updatedData)
        setNewNickname(response.data.nickname || "")
        return updatedData // 업데이트된 데이터 반환
      } else {
        toast({
          title: "오류",
          description: "마이페이지 정보를 불러올 수 없습니다.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "마이페이지 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // 친구 관련 데이터 로드
  const loadFriendData = async () => {
    try {
      // 친구 목록 로드
      const friendsData = await friendService.getFriends()

      if (friendsData && friendsData.length > 0) {
        setFriends(friendsData)
      } else {
        setFriends([])
      }

      // 친구 요청 로드
      const requestsData = await friendService.getFriendRequests()
      if (requestsData) {
        setFriendRequests(requestsData)
      } else {
        setFriendRequests([])
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "친구 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 프로필 수정
  const handleProfileUpdate = async () => {
    if (!newNickname.trim()) {
      toast({
        title: "입력 오류",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      await userService.updateProfile(newNickname.trim(), newProfileImage || undefined)

      // 마이페이지 데이터 다시 로드하고 최신 데이터 받기
      const updatedData = await loadMypageData()

      // AuthContext의 사용자 정보도 업데이트 (프로필 이미지 포함)
      // loadMypageData()에서 반환된 최신 데이터 사용
      if (updatedData) {
        updateUser({ 
          nickname: newNickname.trim(),
          profileImage: updatedData.profileImage 
        })
      }

      setEditDialogOpen(false)
      setNewProfileImage(null)

      toast({
        title: "프로필 수정",
        description: "프로필이 성공적으로 수정되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "프로필 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      await userService.changePassword(currentPassword, newPassword)

      setPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "비밀번호 변경",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // 사용자 검색
  const handleSearchUser = async () => {
    if (!friendEmail.trim() || !friendEmail.includes("@")) {
      toast({
        title: "입력 오류",
        description: "올바른 이메일 주소를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setSearching(true)
      const user = await friendService.searchUserByEmail(friendEmail.trim())

      if (user) {
        setSearchedUser(user)
      } else {
        setSearchedUser(null)
        toast({
          title: "오류",
          description: "사용자를 찾을 수 없습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "사용자 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  // 친구 요청 보내기
  const handleSendFriendRequest = async () => {
    if (!searchedUser) return

    try {
      const result = await friendService.addFriend(searchedUser.email)

      if (result.success) {
        toast({
          title: "성공",
          description: "친구 요청을 보냈습니다.",
        })
        setAddFriendDialogOpen(false)
        setFriendEmail("")
        setSearchedUser(null)
        loadFriendData()
      } else {
        toast({
          title: "알림",
          description: result.message || "친구 요청 전송에 실패했습니다.",
          variant: result.message?.includes("이미") ? "default" : "destructive",
        })

        // 409 에러나 이미 친구인 경우 다이얼로그 닫기
        if (result.message?.includes("이미")) {
          setAddFriendDialogOpen(false)
          setFriendEmail("")
          setSearchedUser(null)
          loadFriendData()
        }
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "친구 요청 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 친구 요청 수락
  const handleAcceptFriendRequest = async (requestId: number) => {

    if (!requestId || isNaN(requestId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 요청 ID입니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 해당 요청의 수신자인지 확인
    const targetRequest = friendRequests.find((req) => req.requestId === requestId)
    if (!targetRequest) {
      toast({
        title: "오류",
        description: "해당 친구 요청을 찾을 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 수신자가 아닌 경우 (userId는 요청자 ID)
    if (targetRequest.userId === user?.id) {
      toast({
        title: "오류",
        description: "자신이 보낸 친구 요청은 수락할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await friendService.acceptFriendRequest(requestId)

      toast({
        title: "성공",
        description: "친구 요청을 수락했습니다.",
      })

      // 친구 데이터 다시 로드
      loadFriendData()
    } catch (error: any) {
      // 토큰 만료 에러 처리 - 토큰 갱신 시도 (401만)
      if (error.message?.includes("인증이 만료되었습니다") || error.message?.includes("토큰")) {
        try {
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            // 토큰 갱신 성공 시 원래 요청 재시도
            handleAcceptFriendRequest(requestId)
            return
          }
        } catch (refreshError) {
          // 토큰 갱신 실패
        }

        // 토큰 갱신 실패 시 로그아웃
        toast({
          title: "세션 만료",
          description: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
        logout()
        router.push("/login")
        return
      } else if (error.message?.includes("권한이 없습니다")) {
        // 403 권한 오류 처리
        toast({
          title: "권한 없음",
          description: "해당 작업을 수행할 권한이 없습니다.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "오류",
        description: "친구 요청 수락 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 친구 삭제
  const handleDeleteFriend = async (friendId: number) => {
    if (!friendId || isNaN(friendId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 친구 ID입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await friendService.deleteFriend(friendId)

      if (success) {
        toast({
          title: "성공",
          description: "친구를 삭제했습니다.",
        })

        // 친구 데이터 다시 로드
        loadFriendData()
      } else {
        toast({
          title: "오류",
          description: "친구 삭제에 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // 토큰 만료 에러 처리
      if (error.message?.includes("인증이 만료되었습니다") || error.message?.includes("토큰")) {
        try {
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            handleDeleteFriend(friendId)
            return
          }
        } catch (refreshError) {
          // 토큰 갱신 실패
        }

        toast({
          title: "세션 만료",
          description: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
        logout()
        router.push("/login")
        return
      }

      toast({
        title: "오류",
        description: "친구 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 친구 요청 거절
  const handleRejectFriendRequest = async (requestId: number) => {
    if (!requestId || isNaN(requestId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 요청 ID입니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 해당 요청의 수신자인지 확인
    const targetRequest = friendRequests.find((req) => req.requestId === requestId)
    if (!targetRequest) {
      toast({
        title: "오류",
        description: "해당 친구 요청을 찾을 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 수신자가 아닌 경우 (userId는 요청자 ID)
    if (targetRequest.userId === user?.id) {
      toast({
        title: "오류",
        description: "자신이 보낸 친구 요청은 거절할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await friendService.rejectFriendRequest(requestId)

      toast({
        title: "성공",
        description: "친구 요청을 거절했습니다.",
      })

      // 친구 데이터 다시 로드
      loadFriendData()
    } catch (error: any) {
      // 토큰 만료 에러 처리 - 토큰 갱신 시도 (401만)
      if (error.message?.includes("인증이 만료되었습니다") || error.message?.includes("토큰")) {
        try {
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            // 토큰 갱신 성공 시 원래 요청 재시도
            handleRejectFriendRequest(requestId)
            return
          }
        } catch (refreshError) {
          // 토큰 갱신 실패
        }

        // 토큰 갱신 실패 시 로그아웃
        toast({
          title: "세션 만료",
          description: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
        logout()
        router.push("/login")
        return
      } else if (error.message?.includes("권한이 없습니다")) {
        // 403 권한 오류 처리
        toast({
          title: "권한 없음",
          description: "해당 작업을 수행할 권한이 없습니다.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "오류",
        description: "친구 요청 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 친구 요청 취소
  const handleCancelFriendRequest = async (requestId: number) => {
    if (!requestId || isNaN(requestId)) {
      toast({
        title: "오류",
        description: "유효하지 않은 요청 ID입니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 해당 요청의 요청자인지 확인
    const targetRequest = sentRequests.find((req: any) => req.requestId === requestId)
    if (!targetRequest) {
      toast({
        title: "오류",
        description: "해당 친구 요청을 찾을 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    // 현재 사용자가 요청자가 아닌 경우 (userId는 수신자 ID)
    if (targetRequest.userId === user?.id) {
      toast({
        title: "오류",
        description: "자신이 받은 친구 요청은 취소할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await friendService.cancelFriendRequest(requestId)

      if (success) {
        toast({
          title: "성공",
          description: "친구 요청을 취소했습니다.",
        })
        loadFriendData()
      } else {
        toast({
          title: "오류",
          description: "친구 요청 취소에 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // 토큰 만료 에러 처리 - 토큰 갱신 시도 (401만)
      if (error.message?.includes("인증이 만료되었습니다") || error.message?.includes("토큰")) {
        try {
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            // 토큰 갱신 성공 시 원래 요청 재시도
            handleCancelFriendRequest(requestId)
            return
          }
        } catch (refreshError) {
          // 토큰 갱신 실패
        }

        // 토큰 갱신 실패 시 로그아웃
        toast({
          title: "세션 만료",
          description: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
        logout()
        router.push("/login")
        return
      } else if (error.message?.includes("권한이 없습니다")) {
        // 403 권한 오류 처리
        toast({
          title: "권한 없음",
          description: "해당 작업을 수행할 권한이 없습니다.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "오류",
        description: "친구 요청 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfileImage(e.target.files[0])
    }
  }

  // 날짜 포맷 함수 추가
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return ""
    }
  }

  // 댓글 내용 파싱 헬퍼 함수
  const parseCommentContent = (content: string): string => {
    if (typeof content === 'string' && content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content)
        return parsed.content || content
      } catch {
        return content
      }
    }
    return content
  }

  // 인증 상태에 따른 렌더링
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">인증 상태를 확인하는 중...</p>
          <p className="text-sm text-gray-500 mb-4">인증이 완료되지 않아 친구 목록을 불러올 수 없습니다.</p>
          <button
            onClick={() => {
              const tokenStatus = {
                accessToken: localStorage.getItem("accessToken") ? "존재함" : "없음",
                refreshToken: localStorage.getItem("refreshToken") ? "존재함" : "없음",
                user: localStorage.getItem("user"),
              }

              if (tokenStatus.accessToken === "없음") {
                alert("토큰이 없습니다. 로그인이 필요합니다.")
                router.push("/login")
              } else {
                alert("토큰이 존재합니다. 페이지를 새로고침합니다.")
                window.location.reload()
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            인증 상태 확인
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              alert("모든 데이터를 삭제했습니다. 로그인 페이지로 이동합니다.")
              router.push("/login")
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            데이터 초기화
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  if (!mypageData) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-500">마이페이지 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={mypageData.profileImage || "/placeholder.svg"} />
                <AvatarFallback>{mypageData.nickname?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{mypageData.nickname}</h1>
              <p className="text-gray-600">{mypageData.email}</p>
              <div className="flex justify-center md:justify-start space-x-4 mt-4">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      프로필 수정
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>프로필 수정</DialogTitle>
                      <DialogDescription>닉네임과 프로필 이미지를 수정할 수 있습니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nickname">닉네임</Label>
                        <Input
                          id="nickname"
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          placeholder="닉네임을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-image">프로필 이미지</Label>
                        <Input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} />
                        {newProfileImage && (
                          <p className="text-sm text-gray-500 mt-1">선택된 파일: {newProfileImage.name}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleProfileUpdate} disabled={updating}>
                          {updating ? "수정 중..." : "수정"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      비밀번호 변경
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>비밀번호 변경</DialogTitle>
                      <DialogDescription>
                        보안을 위해 현재 비밀번호를 입력한 후 새 비밀번호를 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">현재 비밀번호</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">새 비밀번호</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handlePasswordChange} disabled={updating}>
                          {updating ? "변경 중..." : "변경"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      친구 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>친구 추가</DialogTitle>
                      <DialogDescription>이메일 주소로 친구를 검색하고 친구 요청을 보내세요.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="friend-email">친구 이메일</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="friend-email"
                            type="email"
                            value={friendEmail}
                            onChange={(e) => setFriendEmail(e.target.value)}
                            placeholder="친구의 이메일을 입력하세요"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleSearchUser()
                              }
                            }}
                          />
                          <Button onClick={handleSearchUser} disabled={searching} variant="outline">
                            {searching ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 검색 결과 표시 */}
                      {!searching && searchedUser && (
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={searchedUser.profileImage || "/placeholder.svg"} />
                                <AvatarFallback>{searchedUser.nickname?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{searchedUser.nickname}</p>
                                <p className="text-sm text-gray-500">{searchedUser.email}</p>
                              </div>
                            </div>
                            <Button
                              onClick={handleSendFriendRequest}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              친구 요청
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 검색 중 표시 */}
                      {searching && (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                          <span className="ml-2 text-gray-600">검색 중...</span>
                        </div>
                      )}

                      {/* 검색 결과 없음 */}
                      {!searching && friendEmail && !searchedUser && friendEmail.includes("@") && (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">검색 결과가 없습니다.</p>
                          <p className="text-sm text-gray-400 mt-1">이메일 주소를 다시 확인해주세요.</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddFriendDialogOpen(false)
                            setFriendEmail("")
                            setSearchedUser(null)
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">게시글</p>
          <p className="text-xl font-semibold text-blue-600">{mypageData.posts?.length || 0}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">댓글</p>
          <p className="text-xl font-semibold text-green-600">{mypageData.comments?.length || 0}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">즐겨찾기</p>
          <p className="text-xl font-semibold text-red-600">{mypageData.favorites?.length || 0}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">친구</p>
          <p className="text-xl font-semibold text-purple-600">{friends.length}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Bell className="w-6 h-6 text-orange-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">친구요청</p>
          <p className="text-xl font-semibold text-orange-600">{friendRequests.length}</p>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">게시글</TabsTrigger>
          <TabsTrigger value="comments">댓글</TabsTrigger>
          <TabsTrigger value="favorites">즐겨찾기</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          {mypageData.posts && mypageData.posts.length > 0 ? (
            <div className="space-y-4">
              {mypageData.posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500" 
                      onClick={() => router.push(`/community/${post.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors">{post.title}</h3>
                          {post.images && post.images.length > 0 && (
                            <div className="flex items-center gap-1 text-blue-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium">{post.images.length}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="font-medium">{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-500">
                              <Heart className="w-4 h-4" />
                              <span className="font-medium">{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-500">
                              <MessageSquare className="w-4 h-4" />
                              <span className="font-medium">{post.comments}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">작성한 게시글이 없습니다</h3>
              <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="comments" className="mt-6">
          {mypageData.comments && mypageData.comments.length > 0 ? (
            <div className="space-y-4">
              {mypageData.comments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-500" 
                      onClick={() => router.push(`/community/${comment.postId}`)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">댓글</span>
                        </div>
                          <p className="text-gray-800 mb-4 leading-relaxed">
                            {parseCommentContent(comment.content)}
                          </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">게시글:</span>
                            <span className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              {comment.postTitle || "제목 없음"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">작성한 댓글이 없습니다</h3>
              <p className="text-sm">다른 사용자의 게시글에 댓글을 남겨보세요!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="favorites" className="mt-6">
          {mypageData.favorites && mypageData.favorites.length > 0 ? (
            <div className="space-y-4">
              {mypageData.favorites.map((favorite) => (
                <Card key={favorite.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">즐겨찾기</span>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{favorite.placeName}</h3>
                        <p className="text-gray-600 mb-4">{favorite.placeAddress}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {favorite.placeCategory}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(favorite.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">즐겨찾기한 항목이 없습니다</h3>
              <p className="text-sm">마음에 드는 장소를 즐겨찾기에 추가해보세요!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 회원탈퇴 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">계정 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">회원탈퇴</p>
              <p className="text-sm text-gray-600">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
            </div>
            <WithdrawalDialog 
              open={withdrawalDialogOpen} 
              onOpenChange={setWithdrawalDialogOpen} 
              onSuccess={() => {
                logout()
                router.push("/login")
              }} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

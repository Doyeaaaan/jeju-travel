"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, UserPlus, Bell, Check, X, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { useSharedPlans, useMyTripPlans, useMyFriends, useShareTripPlan } from "@/hooks/use-itinerary"
import { friendService } from "@/lib/friend-service"
import type { UserDto } from "@/types/api-types"
import type { Friend, FriendRequest } from "@/lib/friend-service"
import type { FriendResponse } from "@/types/api-types"
import Link from "next/link"

export default function FriendsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, authLoading, refreshToken, logout } = useAuth()
  
  // 실제 API 데이터 훅 사용
  const { data: sharedItineraries, loading: itinerariesLoading, error: itinerariesError } = useSharedPlans()
  const { data: myTripPlansData, loading: tripPlansLoading, error: tripPlansError } = useMyTripPlans()
  const { data: friendsData, loading: friendsLoading, error: friendsError } = useMyFriends()
  const { shareTripPlanAsync, loading: apiShareLoading } = useShareTripPlan()

  const [loading, setLoading] = useState(true)
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [searchedUser, setSearchedUser] = useState<UserDto | null>(null)
  const [searching, setSearching] = useState(false)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<FriendResponse[]>([])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<FriendResponse | null>(null)
  const [mySchedules, setMySchedules] = useState<any[]>([])
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadFriendData()
        // loadMySchedules() - 실제 API 훅으로 대체됨
      } else {
        router.push("/login")
      }
    }
  }, [authLoading, isAuthenticated, user, router])

  // 실제 API 훅 데이터를 mySchedules 상태와 동기화
  useEffect(() => {
    if (myTripPlansData) {

      // MyTripPlan 타입을 기존 schedule 형태로 변환
      const convertedSchedules = myTripPlansData.map(plan => ({
        id: plan.tripPlanId || plan.id, // 백엔드의 tripPlanId를 id로 매핑
        title: plan.planName,
        startDate: plan.startDate,
        endDate: plan.endDate,
      }))
      setMySchedules(convertedSchedules)
    }
  }, [myTripPlansData])

  // 실제 API 훅 데이터를 friends 상태와 동기화
  useEffect(() => {
    if (friendsData) {
      
      // 자기 자신을 제외하고 친구 목록 필터링 (friendId와 userId 모두 체크)
      const filteredFriends = friendsData.filter(friend => {
        const isNotSelfByUserId = friend.userId !== user?.id
        const isNotSelfByFriendId = friend.friendId !== user?.id
        const isNotSelf = isNotSelfByUserId && isNotSelfByFriendId
        
        
        return isNotSelf
      })
      
      setFriends(filteredFriends)
    }
  }, [friendsData, user])

  const loadFriendData = async () => {
    try {
      setLoading(true)

      // 친구 목록 로드
      const friendsData = await friendService.getFriends()
      
      if (friendsData && friendsData.length > 0) {
        // 자기 자신을 제외하고 친구 목록 필터링 (friendId와 userId 모두 체크)
        const filteredFriends = friendsData.filter(friend => {
          const isNotSelfByUserId = friend.userId !== user?.id
          const isNotSelfByFriendId = friend.friendId !== user?.id
          return isNotSelfByUserId && isNotSelfByFriendId
        })
        setFriends(filteredFriends)
      } else {
        setFriends([])
      }

      // 받은 친구 요청 로드
      const receivedRequestsData = await friendService.getReceivedFriendRequests()
      if (receivedRequestsData) {
        setFriendRequests(receivedRequestsData)
      } else {
        setFriendRequests([])
      }

      // 보낸 친구 요청 로드
      const sentRequestsData = await friendService.getSentFriendRequests()
      if (sentRequestsData) {
        setSentRequests(sentRequestsData)
      } else {
        setSentRequests([])
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "친구 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // loadMySchedules 함수 제거됨 - 실제 API 훅(useMyTripPlans)으로 대체

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

  const handleAcceptFriendRequest = async (requestId: number) => {
    try {
      const success = await friendService.acceptFriendRequest(requestId)
      toast({
        title: "성공",
        description: "친구 요청을 수락했습니다.",
      })
      loadFriendData()
    } catch (error: any) {
      toast({
        title: "오류",
        description: "친구 요청 수락 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleRejectFriendRequest = async (requestId: number) => {
    try {
      const success = await friendService.rejectFriendRequest(requestId)
      toast({
        title: "성공",
        description: "친구 요청을 거절했습니다.",
      })
      loadFriendData()
    } catch (error: any) {
      toast({
        title: "오류",
        description: "친구 요청 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFriend = async (friendId: number, status?: string) => {
    try {
      let success = false

      if (status === "PENDING") {
        // 친구 요청 취소
        success = await friendService.cancelFriendRequest(friendId)
        if (success) {
          toast({
            title: "성공",
            description: "친구 요청을 취소했습니다.",
          })
        }
      } else if (status === "ACCEPTED") {
        // 친구 삭제
        success = await friendService.deleteFriend(friendId)
        if (success) {
          toast({
            title: "성공",
            description: "친구를 삭제했습니다.",
          })
        }
      } else {
        // 기본적으로 친구 삭제 시도
        success = await friendService.deleteFriend(friendId)
        if (success) {
          toast({
            title: "성공",
            description: "친구를 삭제했습니다.",
          })
        }
      }

      if (success) {
        loadFriendData()
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: "처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleShareSchedule = (friend: FriendResponse) => {
    setSelectedFriend(friend)
    setShareModalOpen(true)
  }

  const handleShareSpecificSchedule = async (scheduleId: number) => {
    if (!selectedFriend) return

      scheduleId,
      selectedFriend,
      friendId: selectedFriend.userId,
      fullFriendsData: friendsData
    })

    // 문제가 있는 planId 체크
    const problematicPlanIds = [166, 163, 165] // 이미 실패한 ID들
    if (problematicPlanIds.includes(scheduleId)) {
      toast({
        title: "⚠️ 알려진 문제 발생",
        description: `일정 ID ${scheduleId}는 현재 공유할 수 없습니다. 다른 일정으로 시도해주세요.`,
        variant: "destructive",
      })
      setShareLoading(false)
      return
    }

    // 친구 관계 상태 확인
      selectedFriendId: selectedFriend.userId,
      selectedUserId: selectedFriend.userId,
      isInFriendsList: friendsData?.some(f => f.userId === selectedFriend.userId),
      friendsCount: friendsData?.length || 0
    })

    // 공유 가능한 친구 목록 먼저 확인해보기
    try {
      const shareableFriendsUrl = `/api/api/plan/${scheduleId}/shareable-friends`
      const token = localStorage.getItem('accessToken')
      const shareableFriendsResponse = await fetch(shareableFriendsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (shareableFriendsResponse.ok) {
        const shareableFriendsData = await shareableFriendsResponse.json()
      }
    } catch (error) {
    }

    // 친구 관계 검증 실패 시 경고
    const isValidFriend = friendsData?.some(f => f.userId === selectedFriend.userId)
    if (!isValidFriend) {
      toast({
        title: "친구 관계 확인 필요",
        description: "선택한 친구와의 관계를 확인해주세요. 친구 요청이 승인되었는지 확인하세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setShareLoading(true)
      
      
      // 올바른 백엔드 API: 개별 친구 공유
      // POST /api/trip-plans/{planId}/share-with-friend
      const token = localStorage.getItem('accessToken')
      const altResponse = await fetch(`/api/api/trip-plans/${scheduleId}/share-with-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          friendId: selectedFriend.userId,
          permission: "READ_ONLY"
        })
      })
      
      
      if (altResponse.ok) {
        const altData = await altResponse.json()
        
        toast({
          title: "공유 완료 (권한 방식)",
          description: `${selectedFriend.nickname}님에게 일정 조회 권한이 부여되었습니다.`,
        })
        
        setShareModalOpen(false)
        setSelectedFriend(null)
        return
      }
      
      // 대안이 실패하면 백엔드 서버 상태 확인 추천
      
      toast({
        title: "🔧 서버 문제 감지",
        description: "백엔드 서버에 문제가 있는 것 같습니다. 관리자에게 문의하거나 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
      
      // 마지막으로 다른 형식으로 시도해보기
      
      const finalToken = localStorage.getItem('accessToken')
      const finalResponse = await fetch(`/api/api/trip-plans/${scheduleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalToken}`
        },
        body: JSON.stringify({
          "friendIds": [selectedFriend.userId]
        })
      })
      
      
      if (finalResponse.ok) {
        const finalData = await finalResponse.json()
        
        toast({
          title: "공유 완료!",
          description: `${selectedFriend.nickname}님에게 일정이 공유되었습니다.`,
        })
        
        setShareModalOpen(false)
        setSelectedFriend(null)
        return
      } else {
        const errorText = await finalResponse.text()
        throw new Error(`Status: ${finalResponse.status}, Response: ${errorText}`)
      }

      toast({
        title: "공유 완료",
        description: `${selectedFriend.nickname}님에게 일정이 공유되었습니다.`,
      })

      setShareModalOpen(false)
      setSelectedFriend(null)
    } catch (error) {
      toast({
        title: "공유 실패",
        description: "일정 공유에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setShareLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">친구 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Button onClick={() => router.push("/login")}>로그인하기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                재곰제곰
              </Link>
              <div className="ml-8">
                <h1 className="text-xl font-semibold text-gray-900">친구 관리</h1>
              </div>
            </div>
            <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FF6B2C] hover:bg-[#FF6B2C]/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  친구 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>친구 추가</DialogTitle>
                  <DialogDescription>이메일로 친구를 검색하고 친구 요청을 보낼 수 있습니다.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">이메일 주소</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="friend@example.com"
                        onKeyPress={(e) => e.key === "Enter" && handleSearchUser()}
                      />
                      <Button onClick={handleSearchUser} disabled={searching}>
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {searchedUser && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={searchedUser.profileImage || "/placeholder.svg"} />
                            <AvatarFallback>{searchedUser.nickname?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{searchedUser.nickname}</p>
                            <p className="text-sm text-gray-600">{searchedUser.email}</p>
                          </div>
                          <Button onClick={handleSendFriendRequest} size="sm">
                            친구 요청
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">친구 ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">친구 요청 ({friendRequests.length})</TabsTrigger>
            <TabsTrigger value="sent">보낸 요청 ({sentRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 친구가 없습니다</h3>
                <p className="text-gray-600 mb-4">친구를 추가하여 여행 계획을 공유해보세요!</p>
                <div className="text-sm text-gray-500 mb-4">
                  💡 친구 요청을 보내고 승인받으면 여기에 표시됩니다.
                </div>
                <Button onClick={() => setAddFriendDialogOpen(true)} className="bg-[#FF6B2C] hover:bg-[#FF6B2C]/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  친구 추가하기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <Card key={friend.friendId}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={friend.profileImage || "/placeholder.svg"} />
                          <AvatarFallback>{friend.nickname?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{friend.nickname}</p>
                          <p className="text-sm text-gray-600">친구</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareSchedule(friend)}
                            className="text-[#FF6B2C] border-[#FF6B2C] hover:bg-[#FF6B2C]/10"
                          >
                            일정 공유
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFriend(friend.friendId, "ACCEPTED")}
                            className="text-red-600 hover:text-red-700"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">받은 친구 요청이 없습니다</h3>
                <p className="text-gray-600">새로운 친구 요청이 오면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <Card key={request.requestId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={request.profileImage || "/placeholder.svg"} />
                            <AvatarFallback>{request.nickname?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.nickname}</p>
                            <p className="text-sm text-gray-600">친구 요청을 보냈습니다</p>
                            <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptFriendRequest(request.requestId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            수락
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectFriendRequest(request.requestId)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">보낸 친구 요청이 없습니다</h3>
                <p className="text-gray-600">친구에게 요청을 보내면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <Card key={request.requestId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={request.profileImage || "/placeholder.svg"} />
                            <AvatarFallback>{request.nickname?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.nickname}</p>
                            <p className="text-sm text-gray-600">친구 요청 대기 중</p>
                            <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFriend(request.requestId, "PENDING")}
                        >
                          취소
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {shareModalOpen && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">내 일정 공유하기</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedFriend.nickname}님에게 공유</p>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={shareLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {mySchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">공유 가능한 일정이 없습니다.</p>
                  </div>
                ) : (
                  mySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.startDate} ~ {schedule.endDate}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleShareSpecificSchedule(schedule.id)}
                        disabled={shareLoading}
                        className="bg-[#FF6B2C] hover:bg-[#FF6B2C]/90 text-white"
                      >
                        {shareLoading ? "공유 중..." : "공유하기"}
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShareModalOpen(false)} disabled={shareLoading}>
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

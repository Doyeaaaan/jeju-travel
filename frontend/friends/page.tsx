"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  UserPlus,
  Users,
  Bell,
  Share2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Mail,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FriendRequestList from "./components/FriendRequestList"
import SentFriendRequestList from "./components/SentFriendRequestList"
import AddFriendModal from "./components/AddFriendModal"
import ShareModal from "./components/ShareModal"
import { useAuth } from "@/context/AuthContext"
import { friendService, type Friend, type FriendRequest } from "@/lib/friend-service"

// 일정 타입
interface Schedule {
  id: number;
  title: string;
  date: string;
  location: string;
  image?: string;
}

export default function FriendsPage() {
  const { isAuthenticated, user } = useAuth()
  
  // 친구 목록 상태 관리
  const [friends, setFriends] = useState<Friend[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)

  // 친구 검색 상태 관리
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false)

  // 일정 공유 상태 관리
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([])
  const [userSchedules, setUserSchedules] = useState<Schedule[]>([])

  // 친구 목록 가져오기
  const fetchFriends = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const friendsData = await friendService.getFriends()
      setFriends(friendsData)
    } catch (error) {
    }
  }, [isAuthenticated])

  // 받은 친구 요청 목록 가져오기
  const fetchReceivedRequests = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const requestsData = await friendService.getReceivedFriendRequests()
      setReceivedRequests(requestsData)
    } catch (error) {
    }
  }, [isAuthenticated])

  // 보낸 친구 요청 목록 가져오기
  const fetchSentRequests = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const requestsData = await friendService.getSentFriendRequests()
      setSentRequests(requestsData)
    } catch (error) {
    }
  }, [isAuthenticated])

  // 전체 데이터 새로고침
  const refreshData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchFriends(), fetchReceivedRequests(), fetchSentRequests()])
    setLoading(false)
  }, [fetchFriends, fetchReceivedRequests, fetchSentRequests])

  // 초기 데이터 로드
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // 친구 추가 성공 시 새로고침
  const handleAddFriendSuccess = () => {
    refreshData()
  }

  // 친구 요청 처리 후 새로고침
  const handleRequestProcessed = () => {
    refreshData()
  }

  // 일정 공유 처리
  const handleShareSchedule = (friend: Friend) => {
    setSelectedFriend(friend)
    setShareModalOpen(true)
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-6">친구 기능을 사용하려면 로그인해주세요.</p>
          <Link href="/login">
            <Button className="rounded-full">로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">친구</h1>
            </div>
            <Button
              onClick={() => setAddFriendModalOpen(true)}
              className="rounded-full bg-black hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              친구 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="rounded-full">
              <Users className="h-4 w-4 mr-2" />
              내 친구 ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="rounded-full">
              <Bell className="h-4 w-4 mr-2" />
              받은 요청 ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-full">
              <Mail className="h-4 w-4 mr-2" />
              보낸 요청 ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">친구 목록을 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-gray-200">
                            <Image
                              src={friend.profileImage || "/placeholder.svg"}
                              alt={friend.nickname}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{friend.nickname}</h3>
                          <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full"
                        onClick={() => handleShareSchedule(friend)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        일정 공유
                      </Button>
                    </div>
                  </div>
                ))}
                
                {friends.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">아직 친구가 없어요</h3>
                    <p className="text-gray-500 mb-6">
                      친구를 추가하고 함께 여행 계획을 세워보세요!
                    </p>
                    <Button
                      onClick={() => setAddFriendModalOpen(true)}
                      className="rounded-full bg-black hover:bg-gray-800"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      친구 추가하기
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-6">
            <FriendRequestList 
              requests={receivedRequests} 
              onRequestUpdate={handleRequestProcessed} 
            />
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <SentFriendRequestList 
              requests={sentRequests} 
              onRequestUpdate={handleRequestProcessed} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 모달들 */}
      <AddFriendModal
        open={addFriendModalOpen}
        onClose={() => setAddFriendModalOpen(false)}
        onSuccess={handleAddFriendSuccess}
      />

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        friend={selectedFriend}
        schedules={userSchedules}
        selectedScheduleIds={selectedScheduleIds}
        onScheduleSelect={setSelectedScheduleIds}
      />
    </div>
  )
}

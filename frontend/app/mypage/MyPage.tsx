"use client"

import type React from "react"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { PostDto } from "@/types/api-types"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import WithdrawalDialog from "./WithdrawalDialog"
import { userService } from "@/lib/user-service"
import { toast } from "@/hooks/use-toast"
import { Heart, MessageCircle, Calendar, Users, Bell } from "lucide-react"

const DEFAULT_PROFILE_IMAGE = "/images/default_profile.png"
const DEFAULT_BACKGROUND_IMAGE = "/images/default-background.jpg"
const DEFAULT_BACKGROUND_COLOR = "#FFF3E0" // 연한 주황색 배경

// 타입 정의
type LikedPost = {
  id: number
  title: string
  description: string
  tags: string[]
}

type Review = {
  id: number
  title: string
  content: string
  rating: number // 추가된 평점 필드
}

type Trip = {
  id: number
  title: string
  description: string
  tags: string[]
}

interface MypageData {
  email: string
  nickname: string
  profileImage: string | null
  posts: any[]
  comments: any[]
  favorites: any[]
  friends: any[]
}

export default function MyPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [selfIntroduction, setSelfIntroduction] = useState("자기소개를 해주세요!") // 자기소개 상태 추가
  const [isOpen, setIsOpen] = useState(false)
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")

  const { user, updateUser } = useAuth()

  // API 데이터 상태
  const [mypageData, setMypageData] = useState<MypageData | null>(null)
  const [loading, setLoading] = useState(true)

  // 프로필 수정 상태
  const [editPassword, setEditPassword] = useState("")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // 상태 변경: 각 항목에 대한 타입 적용
  const [likedPosts, setLikedPosts] = useState<PostDto[]>([]) // 좋아요한 게시물 상태
  const [reviews, setReviews] = useState<Review[]>([]) // 작성한 리뷰 상태
  const [trips, setTrips] = useState<Trip[]>([]) // 여행 일정 상태

  useEffect(() => {
    
    // AuthContext의 사용자 정보로 초기 상태 설정
    if (user) {
      setNickname(user.nickname || "회원")
      setEmail(user.email || "")
    } else {
    }

    fetchMypageData()

    // localStorage 대신 서버에서 데이터 로드
    // 사용자 정보는 AuthContext에서 관리됨

    // 서버에서 데이터를 로드하므로 localStorage 사용하지 않음
  }, [user])

  const fetchMypageData = async () => {
    try {
      const response = await userService.getMypage()

      if (response.data) {
        
        setMypageData(response.data)
        
        // 사용자 정보 업데이트
        if (response.data.nickname) {
          setNickname(response.data.nickname)
        }
        if (response.data.email) {
          setEmail(response.data.email)
        }

              // API에서 받은 프로필 이미지가 있으면 사용
      if (response.data.profileImage && 
          !response.data.profileImage.startsWith('temp-file-url-') && 
          response.data.profileImage.startsWith('http')) {
        setProfileImage(response.data.profileImage)
      } else {
        // 임시 URL이거나 유효하지 않은 경우 기본 이미지 사용
        setProfileImage(DEFAULT_PROFILE_IMAGE)
      }
      } else {
      }
    } catch (error: any) {
      
      // 에러 발생 시 AuthContext의 사용자 정보 사용
      if (user) {
        setNickname(user.nickname || "회원")
        setEmail(user.email || "")
      }
      
      toast({
        title: "데이터 로드 실패",
        description: "마이페이지 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setBackgroundImage(imageUrl)

        // localStorage 대신 서버에 저장
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "5MB 이하의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        })
        return
      }

      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Image = reader.result as string
        setProfileImage(base64Image)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      toast({
        title: "입력 오류",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    
    setIsUpdating(true)
    try {
      // API로 프로필 업데이트
      const result = await userService.updateProfile(nickname, profileImageFile || undefined)

      // 프로필 이미지 업데이트 확인
      if (result.data && result.data.profileImage && 
          !result.data.profileImage.startsWith('temp-file-url-') && 
          result.data.profileImage.startsWith('http')) {
        setProfileImage(result.data.profileImage)
      } else {
        setProfileImage(DEFAULT_PROFILE_IMAGE)
      }

      // AuthContext를 통해 사용자 정보 업데이트
      updateUser({ nickname, selfIntroduction })

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 수정되었습니다.",
      })

      // 데이터 새로고침
      await fetchMypageData()
      setIsOpen(false)
      setEditPassword("")
      setProfileImageFile(null)
    } catch (error: any) {
      toast({
        title: "프로필 수정 실패",
        description: error.message || "프로필 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 없음'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '날짜 오류'
      }
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return '날짜 오류'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#785549] mx-auto mb-4"></div>
            <p className="text-gray-600">마이페이지 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white pb-12">
      <div className="relative h-40">
        <div className="absolute inset-0">
          {backgroundImage && backgroundImage.startsWith("data:image") ? (
            <Image
              src={backgroundImage || "/placeholder.svg"}
              alt="배경사진"
              fill
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: DEFAULT_BACKGROUND_COLOR }} />
          )}
        </div>

        <div className="absolute top-4 right-6 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundChange}
            className="hidden"
            id="background-photo"
          />
          <label
            htmlFor="background-photo"
            className="text-white text-sm px-3 py-1.5 rounded-md cursor-pointer"
            style={{ backgroundColor: "rgba(255, 143, 0, 0.7)" }}
          >
            배경사진 변경
          </label>

          <button
            onClick={() => {
              // 서버에서 배경 이미지 제거
              setBackgroundImage(null)
            }}
            className="text-sm text-red-600 underline hover:text-red-700"
          >
            배경 삭제
          </button>
        </div>

        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden relative">
            <Image
              src={profileImage ? profileImage : DEFAULT_PROFILE_IMAGE}
              alt="프로필 이미지"
              fill
              className="object-cover"
            />
          </div>
          {/* 프로필 이미지 옆에 사용자 정보 표시 */}
          <div className="absolute left-28 top-2 z-10">
            <div className="text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded-lg shadow-lg border">
              {nickname || "사용자"}
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow-lg mt-1 border">
              {email || "이메일 로딩 중..."}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 px-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {nickname ? `${nickname}님의 마이페이지` : "마이페이지"}
        </h1>
        <p className="text-gray-500 mt-1">{selfIntroduction}</p>

        <div className="flex gap-4 mt-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="px-4 py-2 text-white rounded-md text-sm hover:brightness-110"
                style={{ backgroundColor: "rgba(255, 143, 0, 0.7)" }}
              >
                {" "}
                프로필 수정
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>프로필 수정</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden relative">
                    <Image
                      src={profileImage || DEFAULT_PROFILE_IMAGE}
                      alt="프로필 이미지"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      id="profile-photo"
                    />
                    <label htmlFor="profile-photo" className="cursor-pointer w-full text-center block">
                      프로필 사진 변경
                    </label>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setProfileImage(DEFAULT_PROFILE_IMAGE)
                      updateUser({ profileImage: DEFAULT_PROFILE_IMAGE })
                    }}
                  >
                    프로필 사진 삭제
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nickname">닉네임</Label>
                  <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="selfIntroduction">자기소개</Label>
                  <Input
                    id="selfIntroduction"
                    value={selfIntroduction}
                    onChange={(e) => setSelfIntroduction(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">새 비밀번호 (선택사항)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="변경하지 않으려면 비워두세요"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isUpdating}>
                    {isUpdating ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-1">게시글</h3>
            <p className="text-2xl font-bold text-blue-600">{mypageData?.posts?.length || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-1">댓글</h3>
            <p className="text-2xl font-bold text-green-600">{mypageData?.comments?.length || 0}</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-1">즐겨찾기</h3>
            <p className="text-2xl font-bold text-red-600">{mypageData?.favorites?.length || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-1">친구</h3>
            <p className="text-2xl font-bold text-purple-600">{mypageData?.friends?.length || 0}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Bell className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-700 mb-1">친구요청</h3>
            <p className="text-2xl font-bold text-orange-600">0</p>
          </div>
        </div>

        <Tabs defaultValue="posts" className="mt-8">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="posts">내 게시글</TabsTrigger>
            <TabsTrigger value="comments">내 댓글</TabsTrigger>
            <TabsTrigger value="trips">여행 일정</TabsTrigger>
            <TabsTrigger value="likes">좋아요</TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="space-y-4">
            {trips.length === 0 ? (
              <div className="text-gray-500 text-sm">만든 일정이 없습니다.</div>
            ) : (
              trips.map((trip) => (
                <div key={trip.id} className="border rounded-md overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 relative">
                      <div className="h-32 flex items-center justify-center bg-gray-200 text-gray-500">사진</div>
                    </div>
                    <div className="w-2/3 p-4">
                      <h3 className="font-bold">{trip.title}</h3>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{trip.description}</p>
                      <div className="flex gap-2 mt-3">
                        {trip.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {!mypageData?.posts || mypageData.posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">작성한 게시글이 없습니다.</p>
                <Button onClick={() => router.push("/community/write")}>첫 게시글 작성하기</Button>
              </div>
            ) : (
              mypageData?.posts?.map((post) => (
                <div key={post.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/community/${post.id}`} className="flex-1">
                      <h3 className="font-semibold text-lg hover:text-[#785549] transition-colors">{post.title}</h3>
                    </Link>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>

                  {post.images && post.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.images.slice(0, 3).map((image: any, index: number) => (
                        <div key={image.id} className="w-16 h-16 rounded-md overflow-hidden bg-gray-200">
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={`게시글 이미지 ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                      {post.images.length > 3 && (
                        <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +{post.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.like}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {!mypageData?.comments || mypageData.comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">작성한 댓글이 없습니다.</p>
                <Button onClick={() => router.push("/community")}>커뮤니티로 가기</Button>
              </div>
            ) : (
              mypageData?.comments?.map((comment) => (
                <div key={comment.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/community/${comment.postId}`} className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-600 mb-1">
                        게시글: {comment.postTitle || "제목 없음"}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-gray-800 text-sm mb-3">{comment.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>댓글</span>
                      </div>
                    </div>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            {!mypageData?.favorites || mypageData.favorites.length === 0 ? (
              <div className="text-gray-500 text-sm">좋아요한 장소가 없습니다.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mypageData?.favorites?.map((favorite) => (
                  <div key={favorite.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">장소 ID: {favorite.placeId}</h3>
                        <p className="text-sm text-gray-600 capitalize">{favorite.type.toLowerCase()}</p>
                      </div>
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">친구 목록</h2>
            <Link href="/friends" className="text-sm text-gray-500 hover:underline">
              전체 보기
            </Link>
          </div>
          {!mypageData?.friends || mypageData.friends.length === 0 ? (
            <div className="text-gray-500 text-sm">친구가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {mypageData?.friends?.slice(0, 8).map((friend) => (
                <div key={friend.friendId} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative mb-2">
                    <Image
                      src={friend.profileImage || "/placeholder.svg"}
                      alt={friend.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{friend.nickname}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 회원탈퇴 버튼 */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <button onClick={() => setIsWithdrawalOpen(true)} className="text-sm text-red-600 hover:underline">
            회원탈퇴
          </button>
        </div>
      </div>

      <WithdrawalDialog
        open={isWithdrawalOpen}
        onOpenChange={setIsWithdrawalOpen}
        onSuccess={() => router.push("/withdrawal-complete")}
      />
    </div>
  )
}

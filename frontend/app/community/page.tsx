"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Heart, MessageCircle, Eye, Calendar, ImageIcon, Users } from "lucide-react"
import { postService } from "@/lib/post-service"
import { useAuth } from "@/context/AuthContext"
import type { PostDto } from "@/types/api-types"

export default function CommunityPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<PostDto[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 게시글 목록 조회
  const fetchPosts = async (page = 0, keyword?: string) => {
    // 게시글 목록은 로그인 없이도 볼 수 있도록 수정
    if (!isAuthenticated) {
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await postService.getPosts(page, keyword)

      if (response.data) {
        setPosts(response.data.posts)
        setCurrentPage(response.data.currentPage)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      }
    } catch (error: any) {
      setError("게시글을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(0)
    fetchPosts(0, searchKeyword)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchPosts(page, searchKeyword)
  }

  // 게시글 상세 페이지로 이동
  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`)
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    
    if (!dateString) {
      return '방금 전'
    }
    
    try {
      const now = new Date()
      let date: Date
      
      // 다양한 날짜 형식 시도
      if (dateString.includes('T') && !dateString.includes('Z')) {
        // ISO 형식이지만 timezone이 없는 경우 (예: "2025-01-23T10:30:00")
        date = new Date(dateString + 'Z') // UTC로 처리
      } else if (dateString.includes('T')) {
        // 완전한 ISO 형식 (예: "2025-01-23T10:30:00Z" 또는 "2025-01-23T10:30:00+09:00")
        date = new Date(dateString)
      } else {
        // 일반 날짜 형식
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return '방금 전'
      }
      
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(Math.abs(diffInMs) / (1000 * 60))
      const diffInHours = Math.floor(Math.abs(diffInMs) / (1000 * 60 * 60))
      const diffInDays = Math.floor(Math.abs(diffInMs) / (1000 * 60 * 60 * 24))
      
        원본문자열: dateString,
        파싱된날짜: date.toISOString(),
        로컬날짜: date.toLocaleString('ko-KR'),
        현재시간: now.toISOString(),
        로컬현재시간: now.toLocaleString('ko-KR'),
        시간차이밀리초: diffInMs,
        시간차이분: diffInMinutes,
        시간차이시간: diffInHours,
        시간차이일: diffInDays,
        미래여부: diffInMs < 0 ? '미래' : '과거'
      })
      
      // 미래 시간인 경우 처리
      if (diffInMs < 0) {
        return '방금 전'
      }
      
      // 상대적 시간 표시
      if (diffInMinutes < 1) {
        return '방금 전'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`
      } else if (diffInDays < 7) {
        return `${diffInDays}일 전`
      } else {
        // 1주일 이상이면 정확한 날짜 표시
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}년 ${month}월 ${day}일`
      }
    } catch (error) {
      return '방금 전'
    }
  }

  // 컴포넌트 마운트 시 게시글 조회
  useEffect(() => {
    fetchPosts()
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl bg-card rounded-2xl">
          <CardContent className="pt-12 pb-12 px-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-8">커뮤니티를 이용하려면 로그인해주세요.</p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-14 font-bold rounded-2xl bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                로그인하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="여행 후기, 맛집, 관광지 등을 검색해보세요..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 pr-4 h-12 border border-border focus:border-primary rounded-xl bg-card text-base shadow-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="outline"
              className="h-12 px-6 rounded-xl border-border hover:bg-accent font-medium bg-transparent"
            >
              검색
            </Button>
            <Button
              onClick={() => router.push("/community/write")}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 font-medium"
            >
              글쓰기
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-border bg-card rounded-xl hover:shadow-sm transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-semibold text-primary mb-1">{(totalElements || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground font-medium">전체 게시글</div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card rounded-xl hover:shadow-sm transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-semibold text-primary mb-1">
                  {(posts || []).filter((p) => p.like > 10).length}
                </div>
                <div className="text-sm text-muted-foreground font-medium">인기 게시글</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border border-destructive/20 rounded-xl bg-destructive/5 text-destructive"
            >
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse border border-border rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (posts || []).length === 0 ? (
            <Card className="border border-border rounded-xl bg-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">게시글이 없습니다</h3>
                <p className="text-muted-foreground">첫 번째 게시글을 작성해보세요!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(posts || []).map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border bg-card hover:border-primary/20 group rounded-xl"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.hasImage && (
                            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">{(post.views || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4" />
                            <span className="font-medium">{(post.like || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{(post.commentCount || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {(post.like || 0) > 10 && (
                            <span className="bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-full font-medium">
                              🔥 인기글
                            </span>
                          )}
                          {(post.views || 0) > 100 && (
                            <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                              👀 조회수 높음
                            </span>
                          )}
                          {(post.commentCount || 0) > 5 && (
                            <span className="bg-secondary/10 text-secondary text-xs px-2.5 py-1 rounded-full font-medium">
                              💬 댓글 많음
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="hover:bg-background rounded-lg h-10 px-4 font-medium"
                >
                  이전
                </Button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 font-medium"
                          : "hover:bg-background rounded-lg h-10 px-4 font-medium"
                      }
                    >
                      {pageNum + 1}
                    </Button>
                  )
                })}

                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="hover:bg-background rounded-lg h-10 px-4 font-medium"
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

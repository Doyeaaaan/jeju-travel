"use client"

import { useState } from "react"
import { Star, ThumbsUp, MessageCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: number
  user: {
    name: string
    avatar?: string
    level: string
  }
  rating: number
  content: string
  images?: string[]
  date: string
  likes: number
  isLiked: boolean
  replies: number
}

interface ReviewSectionProps {
  destinationId: number
}

export default function ReviewSection({ destinationId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleLike = (reviewId: number) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              isLiked: !review.isLiked,
              likes: review.isLiked ? review.likes - 1 : review.likes + 1,
            }
          : review,
      ),
    )
  }

  const handleSubmitReview = () => {
    if (!newReview.trim()) return

    const review: Review = {
      id: Date.now(),
      user: {
        name: "나",
        level: "여행 초보",
      },
      rating: newRating,
      content: newReview,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      isLiked: false,
      replies: 0,
    }

    setReviews((prev) => [review, ...prev])
    setNewReview("")
    setNewRating(5)
    setShowReviewForm(false)
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage: (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100,
  }))

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">리뷰 ({reviews.length})</h2>
        <Button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-orange-600 hover:bg-orange-700">
          리뷰 작성
        </Button>
      </div>

      {/* 평점 요약 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= averageRating ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{reviews.length}개의 리뷰</div>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}점</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 작성 폼 */}
      {showReviewForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">평점</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setNewRating(star)} className="p-1">
                      <Star
                        size={24}
                        className={star <= newRating ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">리뷰 내용</label>
                <Textarea
                  placeholder="이곳에 대한 솔직한 후기를 남겨주세요..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} className="bg-orange-600 hover:bg-orange-700">
                  리뷰 등록
                </Button>
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 리뷰 목록 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">리뷰를 불러오는 중...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <p>아직 리뷰가 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.user.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {review.user.level}
                    </Badge>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3">{review.content}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`flex items-center gap-1 text-sm ${
                        review.isLiked ? "text-orange-600" : "text-gray-500"
                      } hover:text-orange-600`}
                    >
                      <ThumbsUp size={16} className={review.isLiked ? "fill-current" : ""} />
                      도움됨 {review.likes}
                    </button>
                    {review.replies > 0 && (
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600">
                        <MessageCircle size={16} />
                        댓글 {review.replies}
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { reviewService, type Review } from "@/lib/review-service"
import { useAuth } from "@/context/AuthContext"

export default function ReviewSection({ 
  destinationId, 
  placeType = 'attraction' 
}: { 
  destinationId: number
  placeType?: 'attraction' | 'restaurant' | 'accommodation'
}) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, content: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  // 리뷰 목록 로드
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        const data = await reviewService.getReviews(destinationId, placeType)
        setReviews(data)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [destinationId, placeType])

  // 리뷰 작성
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!newReview.content.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      await reviewService.createReview({
        placeId: destinationId,
        placeType,
        rating: newReview.rating,
        content: newReview.content.trim()
      })
      
      // 리뷰 목록 새로고침
      const updatedReviews = await reviewService.getReviews(destinationId, placeType)
      setReviews(updatedReviews)
      
      // 폼 초기화
      setNewReview({ rating: 5, content: '' })
      setShowReviewForm(false)
      alert('리뷰가 작성되었습니다.')
    } catch (error) {
      alert('리뷰 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">리뷰 ({reviews.length})</h2>

      {isAuthenticated && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button 
              onClick={() => setShowReviewForm(true)}
              className="w-full py-3 border border-black rounded-md font-medium hover:bg-gray-50"
            >
              리뷰 작성하기
            </button>
          ) : (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">평점:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="리뷰를 작성해주세요..."
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '작성 중...' : '리뷰 작성'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false)
                    setNewReview({ rating: 5, content: '' })
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">리뷰를 불러오는 중...</div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                  {review.user?.profileImage && (
                    <Image
                      src={review.user.profileImage}
                      alt={review.user.nickname}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
                      {review.user?.nickname?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{review.user?.nickname || '익명'}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="ml-2">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-gray-700">{review.content}</div>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="w-full py-2 text-center text-blue-600 hover:text-blue-800"
        >
          {showAllReviews ? "리뷰 접기" : `리뷰 ${reviews.length - 3}개 더 보기`}
        </button>
      )}
    </div>
  )
}

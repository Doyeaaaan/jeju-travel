import { apiClient } from './api-client'

export interface Review {
  id?: number
  userId?: number
  placeId: number
  placeType: 'attraction' | 'restaurant' | 'accommodation'
  rating: number
  content: string
  createdAt?: string
  updatedAt?: string
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export class ReviewService {
  // 리뷰 목록 조회
  async getReviews(placeId: number, placeType: string): Promise<Review[]> {
    try {
      const response = await apiClient.get(`/api/reviews?placeId=${placeId}&placeType=${placeType}`, true)
      return (response as any)?.data || response || []
    } catch (error) {
      return []
    }
  }

  // 리뷰 작성
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<Review> {
    try {
      const response = await apiClient.post('/api/reviews', review, true)
      return (response as any)?.data || response
    } catch (error) {
      throw error
    }
  }

  // 리뷰 수정
  async updateReview(reviewId: number, review: Partial<Review>): Promise<Review> {
    try {
      const response = await apiClient.put(`/api/reviews/${reviewId}`, review, true)
      return (response as any)?.data || response
    } catch (error) {
      throw error
    }
  }

  // 리뷰 삭제
  async deleteReview(reviewId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/reviews/${reviewId}`, true)
      return true
    } catch (error) {
      return false
    }
  }
}

export const reviewService = new ReviewService()

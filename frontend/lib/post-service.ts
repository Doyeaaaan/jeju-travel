import { apiClient, type ApiResponse } from "./api-client"
import type { PostDetailResponseDto, PageResponseDto, PostRequestDto, PostUpdateDto } from "@/types/api-types"

export class PostService {
  // 게시글 전체 조회 (페이지네이션)
  async getPosts(page: number, keyword?: string): Promise<ApiResponse<PageResponseDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
    })

    if (keyword) {
      params.append("keyword", keyword)
    }

    return apiClient.get<PageResponseDto>(`/api/post?${params.toString()}`, false)
  }

  // 게시글 상세 조회
  async getPostById(postId: number): Promise<ApiResponse<PostDetailResponseDto>> {
    return apiClient.get<PostDetailResponseDto>(`/api/post/${postId}`)
  }

  // 게시글 작성
  async createPost(title: string, content: string, images?: File[]): Promise<ApiResponse<any>> {
    const formData = new FormData()

    const postData: PostRequestDto = { title, content }
    formData.append("data", JSON.stringify(postData))

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image)
      })
    }

    return apiClient.postFormData<any>("/api/post", formData)
  }

  // 게시글 수정
  async updatePost(
    postId: number,
    title: string,
    content: string,
    planId?: number,
    deleteImages?: number[],
    newImages?: File[],
  ): Promise<ApiResponse<any>> {
    const formData = new FormData()

    const postData: PostUpdateDto = {
      title,
      content,
      planId,
      deleteImages,
    }
    formData.append("data", JSON.stringify(postData))

    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append("images", image)
      })
    }

    return apiClient.putFormData<any>(`/api/post/${postId}`, formData)
  }

  // 게시글 삭제
  async deletePost(postId: number): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/api/post/${postId}`)
  }

  // 게시글 좋아요
  async likePost(postId: number): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/post/${postId}/like`, {})
  }

  // 게시글 좋아요 취소
  async unlikePost(postId: number): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/api/post/${postId}/like`)
  }

  // 댓글 작성
  async createComment(postId: number, content: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/post/${postId}/comment`, content)
  }

  // 댓글 수정
  async updateComment(postId: number, commentId: number, content: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/post/${postId}/comment/${commentId}`, content)
  }

  // 댓글 삭제
  async deleteComment(postId: number, commentId: number): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/api/post/${postId}/comment/${commentId}`)
  }
}

export const postService = new PostService()

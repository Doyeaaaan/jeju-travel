import axios from 'axios';
import { API_BASE_URL } from '@/app/config';

export interface PostDetailDto {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  // 필요한 다른 필드들을 추가하세요
}

class PostService {
  async getPostDetail(postId: number): Promise<{ data: PostDetailDto }> {
    try {
      const response = await axios.get<{ data: PostDetailDto }>(
        `${API_BASE_URL}/posts/${postId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const postService = new PostService();

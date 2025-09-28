export interface Comment {
  id: number;
  email: string;
  nickname: string;
  profileImage: string;
  content: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  schedule?: string;
  likes: number; // 좋아요 수
  comments: Comment[]; // 댓글 배열
  likedBy?: string[]
  createdAt?: string // ← 이 줄 추가!
  email: string; 
}

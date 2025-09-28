"use client"

import { use } from "react"
import PostDetail from "@/components/post-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PostDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const postId = Number.parseInt(id, 10)

  if (isNaN(postId)) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">잘못된 게시글 ID입니다.</p>
      </div>
    )
  }

  return <PostDetail postId={postId} />
}

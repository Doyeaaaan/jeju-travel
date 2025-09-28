"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ImageIcon } from "lucide-react";
import { Post } from "types/post";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [post, setPost] = useState<Post | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [schedule, setSchedule] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.email) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }
    setEmail(user.email);

    const storedPosts = JSON.parse(localStorage.getItem(`community-posts-${user.email}`) || "[]");
    const target = storedPosts.find((p: Post) => p.id === Number(id));

    if (!target) {
      alert("게시글을 찾을 수 없습니다.");
      router.replace("/community");
      return;
    }

    if (target.email !== user.email) {
      alert("본인 게시글만 수정할 수 있습니다.");
      router.replace("/community");
      return;
    }

    setPost(target);
    setTitle(target.title);
    setContent(target.content);
    setSchedule(target.schedule || "");
    setImagePreview(target.image || null);
  }, [id, router]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    const updatedPost = {
      ...post,
      title,
      content,
      schedule,
      image: imagePreview,
    };

    const storedPosts = JSON.parse(localStorage.getItem(`community-posts-${email}`) || "[]");
    const updatedPosts = storedPosts.map((p: Post) =>
      p.id === Number(id) ? updatedPost : p
    );

    localStorage.setItem(`community-posts-${email}`, JSON.stringify(updatedPosts));
    router.push(`/community/${id}`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!post) return <div className="p-6">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="text-2xl font-bold">게시글 수정</div>
        <button onClick={() => router.back()} className="text-gray-500">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleUpdate} className="p-6">
        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">제목:</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">내용:</label>
          <textarea
            className="w-full p-3 border rounded-md h-64"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">일정:</label>
          <input
            type="datetime-local"
            className="w-full p-3 border rounded-md"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-200 p-3 rounded-md text-gray-700">
            <ImageIcon size={18} />
            사진 변경
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>

          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="미리보기" className="max-w-xs rounded-md" />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800"
          >
            수정 완료
          </button>
        </div>
      </form>
    </div>
  );
}

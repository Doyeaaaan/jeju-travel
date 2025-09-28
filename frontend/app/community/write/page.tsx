"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { postService } from "@/lib/post-service"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileImage, Loader2, ArrowLeft } from "lucide-react"

const CommunityWritePage = () => {
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [images, setImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { user, isAuthenticated, loading } = useAuth()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [...prevImages, ...acceptedFiles])

    const previewURLs = acceptedFiles.map((file) => URL.createObjectURL(file))
    setPreviewImages((prevPreviewImages) => [...prevPreviewImages, ...previewURLs])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".svg"],
    },
  })

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
    setPreviewImages((prevPreviewImages) => prevPreviewImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!isAuthenticated || !user) {
      alert("로그인이 필요합니다.")
      router.push("/login")
      return
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {

      const response = await postService.createPost(title, content, images)

      alert("게시글이 성공적으로 등록되었습니다.")
      router.push("/community")
    } catch (error: any) {

      if (error.message.includes("403")) {
        alert("게시글 작성 권한이 없습니다. 로그인 상태를 확인해주세요.")
        router.push("/login")
      } else if (error.message.includes("401")) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.")
        router.push("/login")
      } else {
        alert(`게시글 등록에 실패했습니다: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">로딩 중...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md toss-card">
          <CardContent className="pt-12 pb-12 px-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FileImage className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-8">글을 작성하려면 로그인해주세요.</p>
              <Button onClick={() => router.push("/login")} className="w-full toss-button">
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={() => router.push("/community")}
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-2 -ml-2"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">뒤로가기</span>
            </Button>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">새 글 작성</h1>
            <p className="text-xl text-muted-foreground">여행 경험을 공유하고 다른 사람들과 소통해보세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="toss-card">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <label htmlFor="title" className="block text-lg font-semibold text-foreground">
                    제목
                  </label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="toss-input text-lg"
                    placeholder="어떤 이야기를 들려주실 건가요?"
                    required
                    disabled={isSubmitting}
                    aria-label="게시글 제목"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="toss-card">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <label htmlFor="content" className="block text-lg font-semibold text-foreground">
                    내용
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="toss-textarea text-base leading-relaxed"
                    placeholder="자세한 내용을 작성해주세요. 여행지의 특별한 경험, 맛집 추천, 유용한 팁 등을 공유해보세요."
                    required
                    disabled={isSubmitting}
                    aria-label="게시글 내용"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="toss-card">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <label className="block text-lg font-semibold text-foreground">
                    사진 첨부 <span className="text-sm font-normal text-muted-foreground">(선택사항)</span>
                  </label>

                  <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent hover:bg-accent/5"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input {...getInputProps()} disabled={isSubmitting} />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      {isDragActive ? (
                        <div>
                          <p className="text-lg font-medium text-accent">사진을 여기에 놓아주세요</p>
                          <p className="text-sm text-muted-foreground">JPG, PNG, GIF 파일을 지원합니다</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-foreground">사진을 드래그하거나 클릭해서 업로드</p>
                          <p className="text-sm text-muted-foreground">JPG, PNG, GIF 파일을 지원합니다</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewImages.map((previewImage, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                            <Image
                              src={previewImage || "/placeholder.svg"}
                              alt={`업로드된 이미지 ${index + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                              className="transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
                            aria-label={`이미지 ${index + 1} 삭제`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="toss-button min-w-[200px] text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>게시 중...</span>
                  </div>
                ) : (
                  "글 게시하기"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CommunityWritePage

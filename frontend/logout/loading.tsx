import { Loader2 } from "lucide-react"

export default function LogoutLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <p className="mt-4 text-gray-500">로그아웃 처리 중...</p>
    </div>
  )
}

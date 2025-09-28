import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-700">로딩 중...</h2>
      </div>
    </div>
  )
}

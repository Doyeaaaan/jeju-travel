import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function WithdrawalCompletePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Image src="/placeholder.svg?height=80&width=80" alt="로고" width={80} height={80} className="mx-auto" />
          </div>

          <h1 className="text-2xl font-bold mb-2">회원탈퇴가 완료되었습니다</h1>
          <p className="text-gray-600 mb-8 text-center">
            그동안 재곰제곰을 이용해 주셔서 감사합니다.
            <br />더 나은 서비스로 다시 만나뵙기를 희망합니다.
          </p>

          <Link href="/" className="w-full">
            <Button className="w-full">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>문의사항이 있으신가요?</p>
        <Link href="/contact" className="text-black font-medium hover:underline">
          고객센터 문의하기
        </Link>
      </div>
    </div>
  )
}

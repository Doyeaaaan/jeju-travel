"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    localStorage.removeItem("user");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            router.push("/login");
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/placeholder.svg?height=80&width=80"
              alt="로고"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>

          <h1 className="text-2xl font-bold mb-2">로그아웃 되었습니다</h1>
          <p className="text-gray-600 mb-6 text-center">
            재곰제곰을 이용해 주셔서 감사합니다.
            <br />
            다음에 또 만나요!
          </p>

          <div className="flex items-center justify-center mb-6">
            <Loader2 className="animate-spin mr-2 text-gray-500" size={20} />
            <span className="text-gray-500">
              {countdown}초 후 로그인 페이지로 이동합니다...
            </span>
          </div>

          <div className="flex gap-4 w-full">
            <Link
              href="/login"
              className="flex-1 py-3 bg-black text-white rounded-md font-medium text-center hover:bg-gray-800"
            >
              로그인 페이지로 이동
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 border border-gray-300 rounded-md font-medium text-center hover:bg-gray-50"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>문의사항이 있으신가요?</p>
        <Link
          href="/contact"
          className="text-black font-medium hover:underline"
        >
          고객센터 문의하기
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { friends } from "@/data/friends";
import Link from "next/link";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import PasswordResetDialog from "./PasswordResetDialog";
import IdFinderDialog from "./IdFinderDialog";
import SocialSignupForm from "./SocialSignupForm";

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [signupMethod, setSignupMethod] = useState<
    "email" | "kakao" | "google" | null
  >(null);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isIdFinderOpen, setIsIdFinderOpen] = useState(false);

  useEffect(() => {
    // localStorage 대신 AuthContext 사용
    // 이미 로그인된 사용자는 AuthProvider에서 관리됨
  }, []);

  const checkDuplicate = async (field: "email" | "nickname", value: string) => {
    // 서버 API를 통해 중복 확인하도록 수정 필요
    // 현재는 임시로 false 반환
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="max-w-md mx-auto p-6">
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === "login"
                ? "border-b-2 border-black font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("login")}
          >
            로그인
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === "signup"
                ? "border-b-2 border-black font-medium"
                : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("signup");
              setSignupMethod(null);
            }}
          >
            회원가입
          </button>
        </div>

        {activeTab === "login" && (
          <>
            <LoginForm
              onFindId={() => setIsIdFinderOpen(true)}
              onFindPassword={() => setIsPasswordResetOpen(true)}
            />
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full py-3 border border-gray-300 rounded-md font-medium flex items-center justify-center hover:bg-gray-50">
                <img
                  src="/kakao-friends-group.png"
                  alt="카카오"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                카카오로 로그인
              </button>
              <button className="w-full py-3 border border-gray-300 rounded-md font-medium flex items-center justify-center hover:bg-gray-50">
                <img
                  src="/colorful-search-bar.png"
                  alt="구글"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                구글로 로그인
              </button>
            </div>
          </>
        )}

        {activeTab === "signup" && (
          <>
            {!signupMethod ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center mb-6">
                  회원가입 방법 선택
                </h2>
                <button
                  className="w-full py-3 border rounded-md flex justify-center items-center"
                  onClick={() => setSignupMethod("kakao")}
                >
                  <img
                    src="/kakao-friends-group.png"
                    alt="카카오"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  카카오로 가입하기
                </button>
                <button
                  className="w-full py-3 border rounded-md flex justify-center items-center"
                  onClick={() => setSignupMethod("google")}
                >
                  <img
                    src="/colorful-search-bar.png"
                    alt="구글"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  구글로 가입하기
                </button>
                <button
                  className="w-full py-3 border rounded-md flex justify-center items-center"
                  onClick={() => setSignupMethod("email")}
                >
                  이메일로 가입하기
                </button>
              </div>
            ) : signupMethod === "email" ? (
              <SignupForm
                onSignupComplete={() => {
                  setSignupMethod(null);
                  setActiveTab("login");
                }}
                checkDuplicate={checkDuplicate}
              />
            ) : (
              <SocialSignupForm provider={signupMethod} />
            )}
          </>
        )}
      </div>

      <PasswordResetDialog
        open={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
      <IdFinderDialog
        open={isIdFinderOpen}
        onClose={() => setIsIdFinderOpen(false)}
      />

      {/* MyPage 미리보기 */}
      {nickname && (
        <div className="p-6 border-t mt-12">
          <h2 className="text-xl font-bold mb-4">마이페이지 미리보기</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="프로필"
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="font-semibold">{nickname}님</p>
              <Link
                href="/mypage"
                className="text-sm text-blue-500 hover:underline"
              >
                마이페이지로 이동 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

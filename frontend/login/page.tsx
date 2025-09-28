"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")

  const handleSignupSuccess = () => {
    setActiveTab("login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">🐻</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">제곰이</h1>
          <p className="text-lg text-gray-600">제주도 여행의 모든 것</p>
          <p className="text-sm text-gray-500 mt-1">계획부터 공유까지, 함께 만드는 제주 여행</p>
        </div>

        {/* 로그인/회원가입 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm font-medium">
              로그인
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-sm font-medium">
              회원가입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <SignupForm onSignupSuccess={handleSignupSuccess} />
          </TabsContent>
        </Tabs>

        {/* 푸터 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>제곰이와 함께 특별한 제주 여행을 계획해보세요</p>
          <p>© 2024 제곰이. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

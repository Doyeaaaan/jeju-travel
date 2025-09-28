"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_PROFILE_IMAGE = "/images/default_profile.png";

type Props = {
  onFindId: () => void;
  onFindPassword: () => void;
};

export default function LoginForm({ onFindId, onFindPassword }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("로그인 성공!");
        router.push("/");
      } else {
        setErrorMessage("로그인에 실패했습니다.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <form className="space-y-4 mb-6" onSubmit={handleLogin}>
      <div>
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          type="email"
          className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-black focus:border-black"
          placeholder="이메일 주소를 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">비밀번호</label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-black focus:border-black"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input type="checkbox" id="remember" className="mr-2" />
          <label htmlFor="remember" className="text-sm text-gray-600">
            로그인 상태 유지
          </label>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={onFindId}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={onFindPassword}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-[rgba(255,143,0,0.7)] text-white rounded-xl mt-6 hover:bg-[rgba(255,143,0,1)] transition-colors"
      >
        로그인
      </button>
    </form>
  );
}

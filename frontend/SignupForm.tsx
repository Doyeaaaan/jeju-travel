"use client";

import { useState } from "react";

type Props = {
  onSignupComplete: () => void;
  checkDuplicate: (
    field: "email" | "nickname",
    value: string
  ) => Promise<boolean>;
};

export default function SignupForm({
  onSignupComplete,
  checkDuplicate,
}: Props) {
  const [emailFront, setEmailFront] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const domainToUse =
      emailDomain === "custom"
        ? customDomain.trim().toLowerCase()
        : emailDomain.trim().toLowerCase();
    const fullEmail = `${emailFront.trim().toLowerCase()}@${domainToUse}`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(fullEmail);

    if (!isValid) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    if (!emailFront || (!emailDomain && !customDomain)) {
      alert("이메일을 올바르게 입력해주세요.");
      return;
    }

    if (emailDomain === "custom" && customDomain.trim() === "") {
      alert("도메인을 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      alert("비밀번호는 8자리 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!fullEmail || !password || !nickname) {
      alert("이메일, 비밀번호, 닉네임을 모두 입력해주세요.");
      return;
    }

    if (!birthYear || !birthMonth || !birthDay) {
      alert("생년월일을 모두 입력해주세요.");
      return;
    }

    const emailExists = await checkDuplicate("email", fullEmail);
    const nicknameExists = await checkDuplicate("nickname", nickname);

    if (emailExists) {
      alert("이미 사용 중인 이메일입니다.");
      return;
    }

    if (nicknameExists) {
      alert("이미 사용 중인 닉네임입니다.");
      return;
    }

    // 실제 서버 API를 통한 회원가입으로 수정 필요
    // 현재는 임시로 성공 처리
    alert("가입이 완료되었습니다!");
    onSignupComplete();
  };

  return (
    <div className="flex flex-col items-center py-6">
      <img
        src="/jegomi.png"
        alt="제곰이"
        className="w-20 h-20 object-contain mb-8"
      />

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            이름
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                id="emailFront"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={emailFront}
                onChange={(e) => setEmailFront(e.target.value)}
                placeholder="example"
              />
            </div>
            <span>@</span>
            <div className="flex-1">
              {emailDomain === "custom" ? (
                <input
                  id="customDomain"
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="도메인 입력"
                />
              ) : (
                <>
                  <label htmlFor="emailDomain" className="sr-only">
                    도메인 선택
                  </label>
                  <select
                    id="emailDomain"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    value={emailDomain}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setEmailDomain("custom");
                        setCustomDomain("");
                      } else {
                        setEmailDomain(val);
                      }
                    }}
                  >
                    <option value="">도메인 선택</option>
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="hotmail.com">hotmail.com</option>
                    <option value="nate.com">nate.com</option>
                    <option value="yahoo.co.kr">yahoo.co.kr</option>
                    <option value="custom">직접 입력</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <input
            id="password"
            type="password"
            className={`w-full p-3 border rounded-md ${
              passwordError ? "border-red-500" : "border-gray-300"
            }`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value.length < 8) {
                setPasswordError("비밀번호는 8자리 이상이어야 합니다.");
              } else {
                setPasswordError("");
              }
            }}
            placeholder="비밀번호를 입력하세요 (8자 이상)"
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>

        <div>
          <input
            id="confirmPassword"
            type="password"
            className={`w-full p-3 border rounded-md ${
              confirmError ? "border-red-500" : "border-gray-300"
            }`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password && e.target.value && password !== e.target.value) {
                setConfirmError("입력하신 비밀번호가 일치하지 않습니다");
              } else {
                setConfirmError("");
              }
            }}
            onBlur={() => {
              if (password && confirmPassword && password !== confirmPassword) {
                setConfirmError("입력하신 비밀번호가 일치하지 않습니다");
              }
            }}
            placeholder="비밀번호를 재입력하세요"
          />
          {confirmError && (
            <p className="text-sm text-red-500 mt-1">{confirmError}</p>
          )}
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">생년월일</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="년도"
              maxLength={4}
              className="w-1/3 p-3 border border-gray-300 rounded-md"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
            <input
              type="text"
              placeholder="월"
              maxLength={2}
              className="w-1/3 p-3 border border-gray-300 rounded-md"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
            />
            <input
              type="text"
              placeholder="일"
              maxLength={2}
              className="w-1/3 p-3 border border-gray-300 rounded-md"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[rgba(255,143,0,0.7)] text-white rounded-xl mt-4 hover:bg-[rgba(255,143,0,1)] transition-colors"
        >
          가입하기
        </button>
      </form>
    </div>
  );
}

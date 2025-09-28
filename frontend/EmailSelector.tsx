"use client";

type Props = {
  emailFront: string;
  setEmailFront: (value: string) => void;
  emailDomain: string;
  setEmailDomain: (value: string) => void;
  customDomain: string;
  setCustomDomain: (value: string) => void;
};

export default function EmailSelector({
  emailFront,
  setEmailFront,
  emailDomain,
  setEmailDomain,
  customDomain,
  setCustomDomain,
}: Props) {
  const isCustom = emailDomain === "custom";

  return (
    <div>
      <label htmlFor="emailFront" className="block text-sm font-medium mb-1">
        이메일
      </label>
      <div className="flex gap-2 items-center">
        {/* 이메일 앞부분 */}
        <input
          id="emailFront"
          type="text"
          maxLength={20}
          className="w-1/2 p-3 border border-gray-300 rounded-md"
          value={emailFront}
          onChange={(e) => setEmailFront(e.target.value)}
        />
        <span>@</span>

        {/* 도메인 선택 or 직접 입력 */}
        {isCustom ? (
          <input
            id="customDomain"
            type="text"
            placeholder="도메인 입력"
            className="w-1/2 p-3 border border-gray-300 rounded-md"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />
        ) : (
          <>
            <label htmlFor="emailDomain" className="sr-only">
              이메일 도메인 선택
            </label>
            <select
              id="emailDomain"
              className="w-1/2 p-3 border border-gray-300 rounded-md"
              value={emailDomain}
              onChange={(e) => {
                const val = e.target.value;
                setEmailDomain(val);
                if (val !== "custom") setCustomDomain(""); // 불필요한 값 초기화
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
  );
}

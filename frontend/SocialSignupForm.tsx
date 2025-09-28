"use client";

type Props = {
  provider: "kakao" | "google";
};

export default function SocialSignupForm({ provider }: Props) {
  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold">필수 정보 입력</h2>
      <p className="text-sm text-gray-500 mb-4">
        {provider === "kakao" ? "카카오" : "구글"}로 가입한 정보를 입력해주세요.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">이름(풀네임)</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="성"
            className="w-1/3 p-3 border rounded-md"
          />
          <input
            type="text"
            placeholder="이름"
            className="w-1/3 p-3 border rounded-md"
          />
          <input
            type="text"
            placeholder="중간이름"
            className="w-1/3 p-3 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">성별</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" name="gender" className="mr-2" /> 여자
          </label>
          <label className="flex items-center">
            <input type="radio" name="gender" className="mr-2" /> 남자
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">닉네임</label>
        <input
          type="text"
          placeholder="닉네임 입력"
          className="w-full p-3 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-black text-white rounded-md mt-4 hover:bg-gray-800 transition-colors"
      >
        확인
      </button>
    </form>
  );
}

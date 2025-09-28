"use client";

import ProfileDisplay, { ProfileImageOnly, ProfileNicknameOnly } from "./ProfileDisplay";
import HeaderProfile, { SimpleHeaderProfile } from "./HeaderProfile";
import UserInfoDebug from "./UserInfoDebug";

/**
 * 프로필 컴포넌트 사용 예시
 * 다양한 크기와 옵션을 보여주는 데모 컴포넌트
 */
export default function ProfileExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          프로필 컴포넌트 예시
        </h1>

        {/* 사용자 정보 디버깅 */}
        <section className="mb-8">
          <UserInfoDebug />
        </section>

        {/* 기본 프로필 표시 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. 기본 프로필 표시</h2>
          <div className="flex items-center gap-4">
            <ProfileDisplay showNickname={true} size="sm" />
            <ProfileDisplay showNickname={true} size="md" />
            <ProfileDisplay showNickname={true} size="lg" />
          </div>
        </section>

        {/* 이미지만 표시 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">2. 프로필 이미지만 표시</h2>
          <div className="flex items-center gap-4">
            <ProfileImageOnly size="sm" />
            <ProfileImageOnly size="md" />
            <ProfileImageOnly size="lg" />
          </div>
        </section>

        {/* 닉네임만 표시 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">3. 닉네임만 표시</h2>
          <div className="flex items-center gap-4">
            <ProfileNicknameOnly size="sm" />
            <ProfileNicknameOnly size="md" />
            <ProfileNicknameOnly size="lg" />
          </div>
        </section>

        {/* 헤더용 프로필 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">4. 헤더용 프로필 (드롭다운 포함)</h2>
          <div className="flex justify-end">
            <HeaderProfile />
          </div>
        </section>

        {/* 간단한 헤더 프로필 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">5. 간단한 헤더 프로필 (드롭다운 없음)</h2>
          <div className="flex justify-end">
            <SimpleHeaderProfile />
          </div>
        </section>

        {/* 자동 갱신 설정 예시 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">6. 자동 갱신 설정 (10초마다)</h2>
          <div className="flex items-center gap-4">
            <ProfileDisplay 
              showNickname={true} 
              size="md" 
              autoRefresh={true}
              refreshInterval={10000}
            />
            <span className="text-sm text-gray-500">
              (10초마다 자동 갱신)
            </span>
          </div>
        </section>

        {/* 사용법 안내 */}
        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">사용법</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>기본 사용법:</strong>
              <pre className="bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`<ProfileDisplay 
  showNickname={true} 
  size="md" 
  autoRefresh={true}
  refreshInterval={30000}
/>`}
              </pre>
            </div>
            <div>
              <strong>헤더에서 사용:</strong>
              <pre className="bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`<HeaderProfile />`}
              </pre>
            </div>
            <div>
              <strong>간단한 표시:</strong>
              <pre className="bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`<SimpleHeaderProfile />`}
              </pre>
            </div>
          </div>
        </section>

        {/* 주요 기능 설명 */}
        <section className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-900">주요 기능</h2>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✅ <strong>캐싱 방지:</strong> 타임스탬프와 랜덤 키로 이미지 캐싱 방지</li>
            <li>✅ <strong>자동 갱신:</strong> 설정된 간격으로 프로필 이미지 자동 갱신</li>
            <li>✅ <strong>에러 처리:</strong> 이미지 로드 실패 시 placeholder 표시</li>
            <li>✅ <strong>반응형 크기:</strong> sm, md, lg 3가지 크기 지원</li>
            <li>✅ <strong>전역 상태 연동:</strong> AuthContext와 완벽 연동</li>
            <li>✅ <strong>페이지 이동 시 유지:</strong> localStorage 기반 상태 관리</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

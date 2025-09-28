# 재곰제곰 - 제주도 여행 플랫폼 프론트엔드

제주도 여행 계획 및 추천 서비스를 제공하는 Next.js 기반 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

- **홈페이지**: 인기 관광지, 맛집, 숙소 소개
- **여행 계획**: AI 기반 개인화된 여행 일정 생성
- **장소 검색**: 관광지, 숙소, 맛집 검색 및 필터링
- **커뮤니티**: 여행 후기 및 정보 공유
- **사용자 관리**: 회원가입, 로그인, 마이페이지
- **지도 서비스**: 카카오맵 기반 장소 표시

## 🛠️ 기술 스택

- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **HTTP Client**: Fetch API with custom wrapper
- **Maps**: Kakao Map API
- **Build Tool**: Next.js built-in
- **Package Manager**: pnpm

## 📁 프로젝트 구조

```
jejuf/
├── app/                          # Next.js App Router
│   ├── accommodations/           # 숙소 페이지
│   ├── attractions/              # 관광지 페이지
│   ├── community/                # 커뮤니티 페이지
│   ├── login/                    # 로그인 페이지
│   ├── mypage/                   # 마이페이지
│   ├── planning/                 # 여행 계획 페이지
│   └── restaurants/              # 맛집 페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── ItineraryMap.tsx          # 여행 일정 지도
│   ├── KakaoMap.tsx              # 카카오맵 컴포넌트
│   └── post-detail.tsx           # 게시글 상세
├── lib/                          # 유틸리티 및 서비스
│   ├── api-client.ts             # API 클라이언트
│   ├── auth-service.ts           # 인증 서비스
│   ├── accommodation-service.ts  # 숙소 서비스
│   ├── attraction-service.ts     # 관광지 서비스
│   ├── kakao-map.ts              # 카카오맵 서비스
│   └── user-service.ts           # 사용자 서비스
├── context/                      # React Context
│   └── AuthContext.tsx           # 인증 컨텍스트
├── types/                        # TypeScript 타입 정의
├── public/                       # 정적 파일
└── styles/                       # 글로벌 스타일
```

## ⚙️ 설치 및 실행

### 1. 사전 요구사항
- Node.js 18.x 이상
- pnpm (권장) 또는 npm

### 2. 환경 설정
```bash
# 1. 저장소 클론
git clone [repository-url]
cd jejuf

# 2. 의존성 설치
pnpm install
# 또는
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경변수 설정
```

### 3. 개발 서버 실행
```bash
# 개발 모드 실행
pnpm dev
# 또는
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 4. 프로덕션 빌드
```bash
# 빌드
pnpm build
# 또는
npm run build

# 프로덕션 서버 실행
pnpm start
# 또는
npm start
```

## 🔧 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수들을 설정하세요:

```env
# 카카오맵 API 키 (필수)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here

# 백엔드 서버 URL (개발용)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 백엔드 서버 도메인 (프로덕션용)
NEXT_PUBLIC_API_DOMAIN=your-production-domain.com

# 개발 환경 설정
NODE_ENV=development
```

## 🎨 주요 페이지

### 1. 홈페이지 (`/`)
- 인기 관광지, 맛집, 숙소 카드 형태로 표시
- 카테고리별 필터링 기능
- 검색 기능

### 2. 여행 계획 (`/planning`)
- **AI 일정 생성**: 키워드 기반 개인화된 여행 일정 생성
- **날짜 선택**: 여행 기간 설정
- **장소 선택**: 관광지, 맛집, 숙소 선택
- **일정 확인**: 생성된 일정 검토 및 수정

### 3. 커뮤니티 (`/community`)
- 여행 후기 게시판
- 게시글 작성, 수정, 삭제
- 댓글 시스템

### 4. 마이페이지 (`/mypage`)
- 사용자 정보 관리
- 내 게시글, 댓글 관리
- 즐겨찾기 관리

## 🗺️ 지도 서비스

### 카카오맵 API 연동
- 장소 마커 표시
- 여행 일정별 지도 표시
- 장소 검색 및 정보 표시

### 설정 방법
1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. 플랫폼 설정에서 웹 도메인 추가
3. JavaScript 키를 환경변수에 설정

## 🔐 인증 시스템

### JWT 기반 인증
- Access Token & Refresh Token
- 자동 토큰 갱신
- 로그인 상태 관리

### OAuth2 지원
- Google 로그인
- Kakao 로그인

## 📱 반응형 디자인

- 모바일 우선 설계
- Tailwind CSS 기반 반응형 레이아웃
- 다양한 화면 크기 지원

## 🧪 테스트

```bash
# 린트 검사
pnpm lint
# 또는
npm run lint

# 타입 체크
pnpm type-check
```

## 📝 Commit Message Convention

| Tag | Description |
|-----|-------------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 스타일 변경 (코드 포매팅, 세미콜론 누락 등) |
| refactor | 코드 리팩토링 |
| test | 테스트 관련 코드 추가, 수정 |
| chore | 설정 변경 |
| ci | CI 설정 파일 수정 |

## 🚀 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t jejuf-frontend .

# 컨테이너 실행
docker run -p 3000:3000 jejuf-frontend
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

# 🔒 GitHub 업로드 전 보안 체크리스트

## 🚨 필수 작업 (업로드 전 반드시 완료)

### 1. 하드코딩된 API 키 제거
- [ ] `components/ItineraryMap.tsx` - 카카오맵 API 키 환경변수로 변경
- [ ] `components/kakao-map.tsx` - 카카오맵 API 키 환경변수로 변경
- [ ] 모든 `.backup` 파일들 삭제 (민감한 정보 포함)

### 2. 서버 정보 제거/변경
- [ ] `next.config.mjs` - 하드코딩된 IP 주소를 환경변수로 변경
- [ ] `lib/api-client.ts.backup*` 파일들 삭제

### 3. 빌드 파일 정리
- [ ] `.next/` 폴더 전체 삭제 (민감한 정보 포함)
- [ ] `node_modules/` 폴더 삭제
- [ ] `*.tar.gz`, `*.zip` 등 압축 파일 삭제

### 4. 환경변수 설정
- [ ] `.env.local` 파일 생성 (실제 키값)
- [ ] `.env.example` 파일 업데이트 (템플릿)
- [ ] `.gitignore`에 `.env*` 추가 확인

## 🔧 수정해야 할 코드

### ItineraryMap.tsx
```typescript
// 현재 (위험)
const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '1bbfc593aa3b5433349d96ad2643d403'

// 수정 후 (안전)
const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
if (!apiKey) {
  throw new Error('카카오맵 API 키가 설정되지 않았습니다.')
}
```

### next.config.mjs
```javascript
// 현재 (위험)
domains: ['localhost', '3.36.89.140'],
destination: 'http://3.36.89.140:8080/api/:path*'

// 수정 후 (안전)
domains: ['localhost', process.env.NEXT_PUBLIC_API_DOMAIN || 'localhost'],
destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/:path*`
```

## 📁 제거해야 할 파일들

```
components/kakao-map.tsx.backup*
lib/api-client.ts.backup*
.next/
node_modules/
*.tar.gz
*.zip
.env (실제 키값이 있는 파일)
```

## ✅ 업로드 후 확인사항

1. **API 키가 코드에 하드코딩되지 않았는지 확인**
2. **서버 IP나 도메인이 노출되지 않았는지 확인**
3. **빌드 파일들이 포함되지 않았는지 확인**
4. **환경변수 템플릿이 올바르게 설정되었는지 확인**

## 🚀 배포 시 주의사항

1. **프로덕션 환경변수 설정**
   - Vercel/Netlify 등 배포 플랫폼에서 환경변수 설정
   - 카카오맵 API 키 도메인 제한 설정

2. **API 키 보안**
   - 카카오 개발자 콘솔에서 도메인 제한 설정
   - 불필요한 권한 제거

3. **서버 보안**
   - 방화벽 설정 확인
   - HTTPS 사용
   - CORS 정책 검토

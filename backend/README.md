# 재곰제곰 - 제주도 여행 플랫폼 백엔드

제주도 여행 계획 및 추천 서비스를 제공하는 Spring Boot 기반 백엔드 애플리케이션입니다.

## 🚀 주요 기능

- **사용자 인증 및 관리**: JWT 기반 인증, OAuth2 (Google, Kakao) 로그인
- **여행지 추천**: AI 기반 개인화된 여행지 추천 시스템
- **일정 계획**: 여행 일정 생성 및 관리
- **커뮤니티**: 여행 후기 및 정보 공유
- **숙소/맛집 정보**: 제주도 숙소 및 맛집 정보 제공

## 🛠️ 기술 스택

- **Backend**: Spring Boot 3.x, Java 17
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Authentication**: JWT, OAuth2
- **Build Tool**: Gradle
- **Cloud Storage**: AWS S3
- **API Documentation**: Swagger/OpenAPI 3

## 📁 프로젝트 구조

```
src/main/java/jeju/bear/
├── BearApplication.java          # 메인 애플리케이션 클래스
├── auth/                        # 인증 관련
│   ├── controller/              # 인증 컨트롤러
│   ├── service/                 # 인증 서비스
│   ├── dto/                     # 인증 DTO
│   └── entity/                  # 인증 엔티티
├── board/                       # 게시판 관련
├── global/                      # 전역 설정
│   ├── common/                  # 공통 응답/에러 처리
│   ├── config/                  # 설정 클래스
│   ├── jwt/                     # JWT 토큰 처리
│   └── security/                # 보안 설정
├── place/                       # 장소 관련 (관광지, 숙소, 맛집)
├── plan/                        # 여행 계획 관련
├── recommend/                   # 추천 시스템
└── user/                        # 사용자 관리
```

## ⚙️ 설치 및 실행

### 1. 사전 요구사항
- Java 17 이상
- MySQL 8.0
- Redis
- Gradle 7.x 이상

### 2. 환경 설정
```bash
# 1. 저장소 클론
git clone [repository-url]
cd back

# 2. 환경변수 설정
cp application.yml.example application.yml
# application.yml 파일을 편집하여 데이터베이스 및 기타 설정 구성

# 3. 의존성 설치
./gradlew build
```

### 3. 실행
```bash
# 개발 환경 실행
./gradlew bootRun

# 또는 JAR 파일로 실행
java -jar build/libs/bear-0.0.1-SNAPSHOT.jar
```

## 🔧 환경변수 설정

다음 환경변수들을 설정해야 합니다:

```yaml
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jeju_bear
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# AWS S3 설정
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_bucket_name

# OAuth2 설정
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

## 📚 API 문서

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 🧪 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 실행
./gradlew test --tests "ClassName"
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

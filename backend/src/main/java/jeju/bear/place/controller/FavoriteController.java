package jeju.bear.place.controller;

import jeju.bear.place.dto.FavoriteDto;
import jeju.bear.place.entity.PlaceType;
import jeju.bear.place.service.FavoriteService;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import jeju.bear.global.security.SecurityUtil;
import jeju.bear.global.common.ApiResponse;
import jeju.bear.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    
    // 컨트롤러 초기화 확인용
    @PostConstruct
    public void init() {
        log.info("🎯 FavoriteController 초기화 완료");
    }

    // 좋아요 추가
    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteDto>> addFavorite(@RequestBody FavoriteRequest request) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("좋아요 추가 요청: userId={}, placeId={}, type={}", userId, request.getPlaceId(), request.getType());
            
            User user = userRepository.getReferenceById(userId);
            FavoriteDto favorite = favoriteService.addFavorite(user, request.getPlaceId(), request.getType());
            return ResponseEntity.ok(ApiResponse.onSuccess(favorite));
        } catch (IllegalArgumentException e) {
            log.warn("좋아요 추가 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("좋아요 추가 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 좋아요 제거
    @DeleteMapping("/{placeId}/{type}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long placeId,
            @PathVariable PlaceType type) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("좋아요 제거 요청: userId={}, placeId={}, type={}", userId, placeId, type);
            
            User user = userRepository.getReferenceById(userId);
            favoriteService.removeFavorite(user, placeId, type);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (IllegalArgumentException e) {
            log.warn("좋아요 제거 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("좋아요 제거 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 사용자의 모든 좋아요 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteDto>>> getUserFavorites() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("🔍 사용자 좋아요 목록 조회 요청: userId={}", userId);
            
            User user = userRepository.getReferenceById(userId);
            List<FavoriteDto> favorites = favoriteService.getUserFavorites(user);
            log.info("✅ 좋아요 목록 조회 성공: userId={}, count={}", userId, favorites.size());
            return ResponseEntity.ok(ApiResponse.onSuccess(favorites));
        } catch (Exception e) {
            log.error("❌ 좋아요 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        log.info("🧪 테스트 엔드포인트 호출됨");
        return ResponseEntity.ok("FavoriteController 테스트 성공");
    }
    
    // 인증 없이 테스트할 수 있는 엔드포인트
    @GetMapping("/public-test")
    public ResponseEntity<String> publicTestEndpoint() {
        log.info("🌐 공개 테스트 엔드포인트 호출됨");
        return ResponseEntity.ok("FavoriteController 공개 테스트 성공");
    }

    // 사용자의 특정 타입 좋아요 조회
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FavoriteDto>> getUserFavoritesByType(@PathVariable PlaceType type) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("사용자 특정 타입 좋아요 목록 조회: userId={}, type={}", userId, type);
            
            User user = userRepository.getReferenceById(userId);
            List<FavoriteDto> favorites = favoriteService.getUserFavoritesByType(user, type);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            log.error("특정 타입 좋아요 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 특정 장소의 좋아요 개수 조회
    @GetMapping("/count/{placeId}/{type}")
    public ResponseEntity<Long> getFavoriteCount(
            @PathVariable Long placeId,
            @PathVariable PlaceType type) {
        log.info("장소 좋아요 개수 조회: placeId={}, type={}", placeId, type);
        
        try {
            long count = favoriteService.getFavoriteCount(placeId, type);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("좋아요 개수 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 사용자가 특정 장소를 좋아요했는지 확인
    @GetMapping("/check/{placeId}/{type}")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long placeId,
            @PathVariable PlaceType type) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("좋아요 상태 확인: userId={}, placeId={}, type={}", userId, placeId, type);
            
            User user = userRepository.getReferenceById(userId);
            boolean isFavorited = favoriteService.isFavorite(user, placeId, type);
            return ResponseEntity.ok(isFavorited);
        } catch (Exception e) {
            log.error("좋아요 상태 확인 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 좋아요 토글 (추가/제거)
    @PostMapping("/toggle")
    public ResponseEntity<Boolean> toggleFavorite(@RequestBody FavoriteRequest request) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            log.info("좋아요 토글 요청: userId={}, placeId={}, type={}", userId, request.getPlaceId(), request.getType());
            
            User user = userRepository.getReferenceById(userId);
            boolean isFavorited = favoriteService.toggleFavorite(user, request.getPlaceId(), request.getType());
            return ResponseEntity.ok(isFavorited);
        } catch (Exception e) {
            log.error("좋아요 토글 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 요청 DTO
    public static class FavoriteRequest {
        private Long placeId;
        private PlaceType type;

        // 기본 생성자
        public FavoriteRequest() {}

        // 생성자
        public FavoriteRequest(Long placeId, PlaceType type) {
            this.placeId = placeId;
            this.type = type;
        }

        public Long getPlaceId() {
            return placeId;
        }

        public void setPlaceId(Long placeId) {
            this.placeId = placeId;
        }

        public PlaceType getType() {
            return type;
        }

        public void setType(PlaceType type) {
            this.type = type;
        }
    }
}

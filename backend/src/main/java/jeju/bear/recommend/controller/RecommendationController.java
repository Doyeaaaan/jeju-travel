package jeju.bear.recommend.controller;

import jeju.bear.common.dto.ApiResponse;
import jeju.bear.recommend.dto.RecommendRequest;
import jeju.bear.recommend.service.RecommendationService;
import jeju.bear.recommend.service.EnhancedKeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService service;
    private final EnhancedKeywordService enhancedKeywordService;

    @PostMapping("/keyword-template")
    public ResponseEntity<?> recommend(@RequestBody RecommendRequest req) {
        return ResponseEntity.ok(ApiResponse.onSuccess(service.recommend(req)));
    }
    
    /**
     * 향상된 키워드 기반 추천 (랜덤화 포함)
     */
    @PostMapping("/enhanced-keyword")
    public ResponseEntity<?> enhancedKeywordRecommend(@RequestBody Map<String, Object> request) {
        try {
            String category = (String) request.get("category");
            @SuppressWarnings("unchecked")
            List<String> keywords = (List<String>) request.get("keywords");
            Integer limit = (Integer) request.getOrDefault("limit", 5);
            
            if (category == null || keywords == null || keywords.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.onError("BAD_REQUEST", "category와 keywords는 필수입니다."));
            }
            
            var recommendations = enhancedKeywordService.getEnhancedRecommendations(
                category, keywords, limit);
            
            return ResponseEntity.ok(ApiResponse.onSuccess(recommendations));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.onError("INTERNAL_ERROR", "추천 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 키워드 조합 가중치 조회
     */
    @PostMapping("/keyword-weights")
    public ResponseEntity<?> getKeywordWeights(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> keywords = (List<String>) request.get("keywords");
            
            if (keywords == null || keywords.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.onError("BAD_REQUEST", "keywords는 필수입니다."));
            }
            
            var weights = enhancedKeywordService.getCombinationWeight(keywords);
            return ResponseEntity.ok(ApiResponse.onSuccess(weights));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.onError("INTERNAL_ERROR", "가중치 계산 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}

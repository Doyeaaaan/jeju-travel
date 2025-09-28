package jeju.bear.place.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.place.dto.PlaceSearchResponse;
import jeju.bear.place.service.KakaoMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
@Tag(name = "KakaoMap", description = "카카오맵 관련 API")
public class KakaoMapController {

    private final KakaoMapService kakaoMapService;

    @Operation(summary = "키워드로 장소 검색")
    @GetMapping("/search/keyword")
    public ResponseEntity<Mono<List<PlaceSearchResponse>>> searchByKeyword(
            @RequestParam String keyword,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "1000") int radius
    ) {
        return ResponseEntity.ok(kakaoMapService.searchByKeyword(keyword, latitude, longitude, radius));
    }

    @Operation(summary = "카테고리로 장소 검색")
    @GetMapping("/search/category")
    public ResponseEntity<Mono<List<PlaceSearchResponse>>> searchByCategory(
            @RequestParam String categoryCode,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "1000") int radius
    ) {
        return ResponseEntity.ok(kakaoMapService.searchByCategory(categoryCode, latitude, longitude, radius));
    }
} 
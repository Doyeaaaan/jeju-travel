package jeju.bear.place.controller;

import jeju.bear.global.common.ApiResponse;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.place.dto.PlaceDto;
import jeju.bear.place.dto.RoomDto;
import jeju.bear.place.service.YeogiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/yeogi")
@RequiredArgsConstructor
public class YeogiController {

    private final YeogiService yeogiService;

    @GetMapping("/places")
    public ResponseEntity<ApiResponse<List<PlaceDto>>> getPlaces(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam int personal,
            @RequestParam(value = "limit", defaultValue = "100") int limit
    ) {
        try {
            // keyword가 없으면 region을 사용 (하위 호환성)
            String searchKeyword = keyword != null ? keyword : region;
            
            log.info("숙소 검색 요청: keyword={}, checkIn={}, checkOut={}, personal={}, limit={}", 
                     searchKeyword, checkIn, checkOut, personal, limit);
            
            log.info("Service 호출 시작...");
            List<PlaceDto> places = yeogiService.fetchPlaceIds(searchKeyword, checkIn, checkOut, personal, limit);
            log.info("Service 호출 완료. 결과: {} 개의 숙소", places.size());
            
            log.info("숙소 검색 결과: {} 개의 숙소 찾음", places.size());
            return ResponseEntity.ok(ApiResponse.onSuccess(places));
        } catch (Exception e) {
            log.error("숙소 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @GetMapping("/places/{placeId}")
    public ResponseEntity<ApiResponse<PlaceDto>> getPlaceDetail(
            @PathVariable String placeId,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam int personal
    ) {
        try {
            log.info("숙소 상세 정보 요청: placeId={}, checkIn={}, checkOut={}, personal={}", 
                     placeId, checkIn, checkOut, personal);
            
            // 숙소 ID로 검색
            List<PlaceDto> places = yeogiService.fetchPlaceById(placeId, checkIn, checkOut, personal);
            
            if (places.isEmpty()) {
                log.warn("숙소를 찾을 수 없음: placeId={}", placeId);
                return ResponseEntity.status(404)
                        .body(ApiResponse.onFailure(ErrorCode.NOT_FOUND, "숙소를 찾을 수 없습니다."));
            }
            
            log.info("숙소 상세 정보 조회 성공: placeId={}", placeId);
            return ResponseEntity.ok(ApiResponse.onSuccess(places.get(0)));
        } catch (Exception e) {
            log.error("숙소 상세 정보 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @GetMapping("/places/{placeId}/location")
    public ResponseEntity<ApiResponse<PlaceDto>> getPlaceLocation(
            @PathVariable String placeId,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam int personal
    ) {
        try {
            log.info("숙소 위치 정보 요청: placeId={}", placeId);
            
            List<PlaceDto> places = yeogiService.fetchPlaceById(placeId, checkIn, checkOut, personal);
            
            if (places.isEmpty()) {
                log.warn("숙소를 찾을 수 없음: placeId={}", placeId);
                return ResponseEntity.status(404)
                        .body(ApiResponse.onFailure(ErrorCode.NOT_FOUND, "숙소를 찾을 수 없습니다."));
            }
            
            PlaceDto place = places.get(0);
            if (place.getLatitude() == null || place.getLongitude() == null) {
                log.warn("숙소 위치 정보가 없음: placeId={}", placeId);
                return ResponseEntity.status(404)
                        .body(ApiResponse.onFailure(ErrorCode.NOT_FOUND, "숙소 위치 정보를 찾을 수 없습니다."));
            }
            
            log.info("숙소 위치 정보 조회 성공: placeId={}, lat={}, lng={}", 
                     placeId, place.getLatitude(), place.getLongitude());
            return ResponseEntity.ok(ApiResponse.onSuccess(place));
        } catch (Exception e) {
            log.error("숙소 위치 정보 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @GetMapping("/rooms/{placeId}")
    public ResponseEntity<ApiResponse<List<RoomDto>>> getRooms(
            @PathVariable String placeId,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam int personal
    ) {
        try {
            log.info("객실 검색 요청: placeId={}, checkIn={}, checkOut={}, personal={}", 
                     placeId, checkIn, checkOut, personal);
            List<RoomDto> rooms = yeogiService.fetchRoomsWithPrices(placeId, checkIn, checkOut, personal);
            log.info("객실 검색 결과: {} 개의 객실 찾음", rooms.size());
            return ResponseEntity.ok(ApiResponse.onSuccess(rooms));
        } catch (Exception e) {
            log.error("객실 검색 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }
}
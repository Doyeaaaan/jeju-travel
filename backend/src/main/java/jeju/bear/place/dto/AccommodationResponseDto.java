package jeju.bear.place.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class AccommodationResponseDto {
    private String id;              // 숙소 ID
    private String name;            // 숙소 이름
    private String imageUrl;        // 대표 이미지 URL
    private double latitude;        // 위도
    private double longitude;       // 경도
    private Long minPrice;          // 최저 가격
    private List<RoomDto> rooms;    // 객실 정보
    private String category;        // 카테고리 (예: "ACCOMMODATION")
    
    // 카카오맵 마커에 표시할 정보
    private String address;         // 주소
    private String roadAddress;     // 도로명 주소
    private String phone;           // 전화번호
    private String placeUrl;        // 카카오맵 URL
} 
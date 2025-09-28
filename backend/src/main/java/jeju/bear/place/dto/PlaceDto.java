package jeju.bear.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlaceDto {
    private Long id;  // String에서 Long으로 변경
    private String name;
    private String grade;  // 등급 정보 추가 (예: "특급 · 호텔", "블랙 · 5성급 · 호텔" 등)
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private String address;
}
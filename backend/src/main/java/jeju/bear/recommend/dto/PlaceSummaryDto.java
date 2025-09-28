package jeju.bear.recommend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSummaryDto {
    private String id;
    private String name;
    private String category;  // 관광지/맛집/숙소/카페
    private Double lat;       // nullable
    private Double lng;       // nullable
    private Double rating;    // 평점 (4.0-5.0)
    private String reviews;   // 리뷰 텍스트
}

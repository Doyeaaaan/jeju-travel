package jeju.bear.recommend.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendRequest {
    private LocalDate startDate;           // 사용자 입력 날짜
    private LocalDate endDate;             // 사용자 입력 날짜
    private int travelers;                 // 인원
    // 예: {"관광지":["자연","체험"], "숙소":["힐링","청결"], "맛집":["분위기","맛"], "카페":["뷰"]}
    private Map<String, List<String>> keywords;
    private Integer numOptions;            // 선택지 개수(기본 2)
}

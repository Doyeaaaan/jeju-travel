package jeju.bear.recommend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryOptionDto {
    private String title;        // "키워드 매칭 코스 A" 등
    private List<DayDto> days;   // days 길이
}

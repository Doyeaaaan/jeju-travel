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
public class RecommendResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private int travelers;
    private Map<String, List<String>> selectedKeywords;
    private List<ItineraryOptionDto> options;
}

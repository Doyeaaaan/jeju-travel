package jeju.bear.recommend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDto {
    private String label;     // "협재해수욕장", "숙소 체크인" 등
    private String category;  // 관광지/맛집/숙소/카페
    private String placeId;   // 가상 항목(체크인 등)은 null 가능
    private String slot;      // MORNING | LUNCH | AFTERNOON | DINNER | LODGING
}

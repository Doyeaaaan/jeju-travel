package jeju.bear.recommend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayDto {
    private int day;              // 1..days
    private List<ItemDto> items;  // 하루 슬롯들
}

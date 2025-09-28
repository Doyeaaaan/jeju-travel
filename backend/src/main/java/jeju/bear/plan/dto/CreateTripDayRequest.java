package jeju.bear.plan.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTripDayRequest {
    @NotNull
    private Integer sequence;     // 순서(몇 번째 day 인지)

    @NotNull
    private LocalDate dayDate;    // 여행 날짜
}

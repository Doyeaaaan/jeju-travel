package jeju.bear.plan.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddTripDayRequest {
    @NotNull
    private LocalDate date;
}

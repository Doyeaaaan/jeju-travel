package jeju.bear.plan.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTripPlanRequest {
    @NotBlank private String planName;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
}

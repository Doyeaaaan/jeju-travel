package jeju.bear.plan.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSequenceRequest {
    @NotNull
    private Long tripDayId;

    @NotEmpty
    private List<Long> orderedDestinationIds;
}

package jeju.bear.plan.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveDestinationRequest {
    private Integer fromSequence;
    private Integer toSequence;
} 
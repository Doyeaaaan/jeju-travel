package jeju.bear.plan.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDestinationRequest {
    private String transportation;
    private Integer duration;
    private Integer price;
    private String memo;
    private Integer sequence;
} 
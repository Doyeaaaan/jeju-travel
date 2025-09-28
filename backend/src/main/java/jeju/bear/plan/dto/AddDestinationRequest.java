package jeju.bear.plan.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AddDestinationRequest {
    private String placeId;
    private String placeName;
    private String address;
    private String category;
    private Integer sequence;
    private String memo;
} 
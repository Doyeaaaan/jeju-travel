// src/main/java/com/jeju/bear/plan/dto/CreateDestinationRequest.java
package jeju.bear.plan.dto;

import lombok.*;
import jakarta.validation.constraints.*;  // javax → jakarta로 변경

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDestinationRequest {
    @NotNull
    private Long tripDayId;

    @NotNull
    private Integer sequence;

    private String transportation;

    private Integer duration;

    @NotBlank
    private String placeId;

    @NotBlank
    private String type;

    private Integer price;

    private String placeName;
    
    private String address;
    
    private String memo;
}

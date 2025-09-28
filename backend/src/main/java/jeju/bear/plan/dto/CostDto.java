package jeju.bear.plan.dto;

import lombok.*;
import jeju.bear.plan.entity.Cost;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CostDto {
    private Long costId;
    private String category;
    private Integer otherCost;
    private Integer totalCost;

    public static CostDto from(Cost c) {
        return CostDto.builder()
                .costId(c.getCostId())
                .category(c.getCategory())
                .otherCost(c.getOtherCost())
                .totalCost(c.getTotalCost())
                .build();
    }
}
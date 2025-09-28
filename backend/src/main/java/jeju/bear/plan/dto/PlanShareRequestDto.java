package jeju.bear.plan.dto;

import jeju.bear.plan.entity.SharePermission;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanShareRequestDto {
    private Long planId;
    private Long targetUserId;
    private SharePermission permission;
} 
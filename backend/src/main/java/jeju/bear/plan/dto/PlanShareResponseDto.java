package jeju.bear.plan.dto;

import jeju.bear.plan.entity.SharePermission;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanShareResponseDto {
    private Long id;
    private Long planId;
    private Long userId;
    private String userNickname;
    private String userProfileImage;
    private SharePermission permission;
    private LocalDateTime sharedAt;
} 
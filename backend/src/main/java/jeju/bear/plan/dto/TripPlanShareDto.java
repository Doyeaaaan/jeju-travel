package jeju.bear.plan.dto;

import jeju.bear.plan.entity.TripPlanShare;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripPlanShareDto {
    private Long id;
    private Long tripPlanId;
    private Long sharedWithUserId;
    private String sharedWithUserEmail;
    private String permission;
    private LocalDateTime sharedAt;
    private boolean isAccepted;

    public static TripPlanShareDto from(TripPlanShare share) {
        return TripPlanShareDto.builder()
                .id(share.getId())
                .tripPlanId(share.getTripPlan().getTripPlanId())
                .sharedWithUserId(share.getSharedWithUser().getId())
                .sharedWithUserEmail(share.getSharedWithUser().getEmail())
                .permission(share.getPermission().name())
                .sharedAt(share.getSharedAt())
                .isAccepted(true) // 기본값으로 true 설정
                .build();
    }
} 
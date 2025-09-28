package jeju.bear.plan.service;

import jeju.bear.plan.dto.PlanShareRequestDto;
import jeju.bear.plan.dto.PlanShareResponseDto;
import jeju.bear.plan.entity.SharePermission;

import java.util.List;

public interface PlanShareService {
    void sharePlan(PlanShareRequestDto request);
    List<PlanShareResponseDto> getSharedPlans();
    void updateSharePermission(Long planId, Long userId, SharePermission permission);
    void removeSharePermission(Long planId, Long userId);
    Object getShareableFriends(Long planId);
} 
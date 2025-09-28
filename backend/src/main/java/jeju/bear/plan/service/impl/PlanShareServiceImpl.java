package jeju.bear.plan.service.impl;

import jeju.bear.plan.dto.PlanShareRequestDto;
import jeju.bear.plan.dto.PlanShareResponseDto;
import jeju.bear.plan.entity.SharePermission;
import jeju.bear.plan.entity.TripPlan;
import jeju.bear.plan.entity.TripPlanShare;
import jeju.bear.plan.repository.TripPlanRepository;
import jeju.bear.plan.repository.TripPlanShareRepository;
import jeju.bear.plan.service.PlanShareService;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class PlanShareServiceImpl implements PlanShareService {

    private final TripPlanShareRepository tripPlanShareRepository;
    private final TripPlanRepository tripPlanRepository;
    private final UserRepository userRepository;

    @Override
    public void sharePlan(PlanShareRequestDto request) {
        TripPlan tripPlan = tripPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));
        
        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        TripPlanShare share = TripPlanShare.builder()
                .tripPlan(tripPlan)
                .sharedWithUser(targetUser)
                .permission(request.getPermission())
                .build();

        tripPlanShareRepository.save(share);
        log.info("✅ 일정 공유 완료: planId={}, userId={}, permission={}", 
                request.getPlanId(), request.getTargetUserId(), request.getPermission());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanShareResponseDto> getSharedPlans() {
        // 현재 사용자와 공유된 일정들 조회 (실제로는 인증된 사용자 ID 필요)
        List<TripPlanShare> shares = tripPlanShareRepository.findAll();
        
        return shares.stream()
                .map(share -> PlanShareResponseDto.builder()
                        .id(share.getId())
                        .planId(share.getTripPlan().getTripPlanId())
                        .userId(share.getSharedWithUser().getId())
                        .userNickname(share.getSharedWithUser().getNickname())
                        .userProfileImage(share.getSharedWithUser().getProfileImage())
                        .permission(share.getPermission())
                        .sharedAt(share.getSharedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void updateSharePermission(Long planId, Long userId, SharePermission permission) {
        TripPlanShare share = tripPlanShareRepository.findByTripPlan_TripPlanIdAndSharedWithUserId(planId, userId)
                .orElseThrow(() -> new RuntimeException("공유 정보를 찾을 수 없습니다."));
        
        share.setPermission(permission);
        tripPlanShareRepository.save(share);
        log.info("✅ 공유 권한 수정 완료: planId={}, userId={}, permission={}", planId, userId, permission);
    }

    @Override
    public void removeSharePermission(Long planId, Long userId) {
        TripPlanShare share = tripPlanShareRepository.findByTripPlan_TripPlanIdAndSharedWithUserId(planId, userId)
                .orElseThrow(() -> new RuntimeException("공유 정보를 찾을 수 없습니다."));
        
        tripPlanShareRepository.delete(share);
        log.info("✅ 일정 공유 해제 완료: planId={}, userId={}", planId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Object getShareableFriends(Long planId) {
        // 공유 가능한 친구 목록 조회 (실제로는 친구 관계 확인 필요)
        List<User> users = userRepository.findAll();
        return users.stream()
                .limit(10) // 임시로 10명만 반환
                .collect(Collectors.toList());
    }
} 
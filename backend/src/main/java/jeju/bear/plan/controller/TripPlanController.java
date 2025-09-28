package jeju.bear.plan.controller;

import jakarta.validation.Valid;
import jeju.bear.global.common.ApiResponse;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.global.common.SuccessCode;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.security.SecurityUtil;
import jeju.bear.plan.dto.CreateTripPlanRequest;
import jeju.bear.plan.dto.TripPlanDto;
import jeju.bear.plan.dto.TripDayWithDestinationsDto;
import jeju.bear.plan.dto.CreatePostRequest;
import jeju.bear.plan.dto.ShareWithFriendRequest;
import jeju.bear.plan.dto.UpdateVisibilityRequest;
import jeju.bear.plan.dto.AddDestinationRequest;
import jeju.bear.plan.dto.UpdateDestinationRequest;
import jeju.bear.plan.dto.MoveDestinationRequest;
import jeju.bear.plan.service.TripPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-plans")
@RequiredArgsConstructor
public class TripPlanController {
    private final TripPlanService tripPlanService;
    private final SecurityUtil securityUtil;

    // 1) 여행 계획 생성
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TripPlanDto>> create(
            @RequestBody @Valid CreateTripPlanRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        TripPlanDto dto = tripPlanService.createTripPlan(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.onSuccess(dto));
    }

    // 2) 단일 여행 계획 조회
    @GetMapping("/{planId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TripPlanDto>> get(
            @PathVariable Long planId
    ) {
        Long userId = securityUtil.getCurrentUserId();
        TripPlanDto dto = tripPlanService.getTripPlan(planId, userId);
        if (dto == null) {
            throw new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND);
        }
        return ResponseEntity.ok(ApiResponse.onSuccess(dto));
    }

    // 3) 일자별 목적지 목록 조회
    @GetMapping("/{planId}/days-with-dests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TripDayWithDestinationsDto>>> listDaysWithDestinations(
            @PathVariable Long planId
    ) {
        Long userId = securityUtil.getCurrentUserId();
        if (!tripPlanService.existsById(planId)) {
            throw new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND);
        }
        List<TripDayWithDestinationsDto> list = tripPlanService.getDaysWithDestinations(planId, userId);
        return ResponseEntity.ok(ApiResponse.onSuccess(list));
    }

    // 4) 사용자의 모든 여행 계획 조회
    @GetMapping("/my-plans")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TripPlanDto>> getMyPlans() {
        Long userId = securityUtil.getCurrentUserId();
        List<TripPlanDto> plans = tripPlanService.getTripPlansByUserId(userId);
        return ResponseEntity.ok(plans);
    }

    // 5) 여행 계획 삭제
    @DeleteMapping("/{planId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long planId) {
        Long userId = securityUtil.getCurrentUserId();
        if (!tripPlanService.existsById(planId)) {
            throw new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND);
        }
        if (!tripPlanService.hasAccess(planId, userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        tripPlanService.deleteTripPlan(planId, userId);
        return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
    }

    @PostMapping("/{planId}/share-as-post")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> shareAsPost(
            @PathVariable Long planId,
            @RequestBody CreatePostRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        if (!tripPlanService.existsById(planId)) {
            throw new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND);
        }
        if (tripPlanService.isAlreadyShared(planId)) {
            throw new CustomException(ErrorCode.ALREADY_SHARED);
        }
        tripPlanService.shareAsPost(planId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.onSuccess(null));
    }

    @PostMapping("/{planId}/share-with-friend")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> shareWithFriend(
            @PathVariable Long planId,
            @RequestBody ShareWithFriendRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.onSuccess(tripPlanService.shareWithFriend(planId, userId, request)));
    }

    @PatchMapping("/{planId}/visibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> updateVisibility(
            @PathVariable Long planId,
            @RequestBody UpdateVisibilityRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.onSuccess(
                tripPlanService.updateVisibility(planId, userId, request.isPublic())));
    }

    @GetMapping("/shared-with-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> getSharedWithMe() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.onSuccess(tripPlanService.getSharedPlans(userId)));
    }

    @PostMapping("/{planId}/days/{dayId}/destinations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> addDestination(
            @PathVariable Long planId,
            @PathVariable Long dayId,
            @RequestBody AddDestinationRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.onSuccess(tripPlanService.addDestination(planId, dayId, userId, request)));
    }

    @DeleteMapping("/{planId}/days/{dayId}/destinations/{destinationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> removeDestination(
            @PathVariable Long planId,
            @PathVariable Long dayId,
            @PathVariable Long destinationId
    ) {
        Long userId = securityUtil.getCurrentUserId();
        tripPlanService.removeDestination(planId, dayId, destinationId, userId);
        return ResponseEntity.ok(ApiResponse.onSuccess(null));
    }

    @PatchMapping("/{planId}/days/{dayId}/destinations/{destinationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> updateDestination(
            @PathVariable Long planId,
            @PathVariable Long dayId,
            @PathVariable Long destinationId,
            @RequestBody UpdateDestinationRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.onSuccess(
                tripPlanService.updateDestination(planId, dayId, destinationId, userId, request)));
    }

    @PatchMapping("/{planId}/days/{dayId}/destinations/reorder")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> moveDestination(
            @PathVariable Long planId,
            @PathVariable Long dayId,
            @RequestBody MoveDestinationRequest request
    ) {
        Long userId = securityUtil.getCurrentUserId();
        tripPlanService.moveDestination(planId, dayId, userId, request);
        return ResponseEntity.ok(ApiResponse.onSuccess(null));
    }
}

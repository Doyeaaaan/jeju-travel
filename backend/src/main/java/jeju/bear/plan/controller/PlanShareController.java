package jeju.bear.plan.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.global.common.ApiResponse;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.global.common.SuccessCode;
import jeju.bear.plan.dto.PlanShareRequestDto;
import jeju.bear.plan.dto.PlanShareResponseDto;
import jeju.bear.plan.service.PlanShareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/plan")
@Tag(name = "Plan Share", description = "일정 공유 관련 API")
public class PlanShareController {

    private final PlanShareService planShareService;

    @Operation(summary = "일정 공유 권한 부여")
    @PostMapping("/share")
    public ResponseEntity<ApiResponse<?>> sharePlan(@RequestBody PlanShareRequestDto request) {
        try {
            planShareService.sharePlan(request);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (Exception e) {
            log.error("❌ 일정 공유 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @Operation(summary = "공유된 일정 목록 조회")
    @GetMapping("/shared")
    public ResponseEntity<ApiResponse<List<PlanShareResponseDto>>> getSharedPlans() {
        try {
            List<PlanShareResponseDto> sharedPlans = planShareService.getSharedPlans();
            return ResponseEntity.ok(ApiResponse.onSuccess(sharedPlans));
        } catch (Exception e) {
            log.error("❌ 공유된 일정 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @Operation(summary = "일정 공유 권한 수정")
    @PutMapping("/share/{planId}/user/{userId}")
    public ResponseEntity<ApiResponse<?>> updateSharePermission(
            @PathVariable Long planId,
            @PathVariable Long userId,
            @RequestBody PlanShareRequestDto request) {
        try {
            planShareService.updateSharePermission(planId, userId, request.getPermission());
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (Exception e) {
            log.error("❌ 공유 권한 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @Operation(summary = "일정 공유 해제")
    @DeleteMapping("/share/{planId}/user/{userId}")
    public ResponseEntity<ApiResponse<?>> removeSharePermission(
            @PathVariable Long planId,
            @PathVariable Long userId) {
        try {
            planShareService.removeSharePermission(planId, userId);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (Exception e) {
            log.error("❌ 일정 공유 해제 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    @Operation(summary = "공유 가능한 친구 목록 조회")
    @GetMapping("/{planId}/shareable-friends")
    public ResponseEntity<ApiResponse<?>> getShareableFriends(@PathVariable Long planId) {
        try {
            var shareableFriends = planShareService.getShareableFriends(planId);
            return ResponseEntity.ok(ApiResponse.onSuccess(shareableFriends));
        } catch (Exception e) {
            log.error("❌ 공유 가능한 친구 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }
} 
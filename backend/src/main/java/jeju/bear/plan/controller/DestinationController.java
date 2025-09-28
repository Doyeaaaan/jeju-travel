package jeju.bear.plan.controller;

import jeju.bear.global.common.ApiResponse;
import jeju.bear.global.common.CurrentUser;
import jeju.bear.global.common.SuccessCode;
import jeju.bear.plan.dto.CreateDestinationRequest;
import jeju.bear.plan.dto.DestinationDto;
import jeju.bear.plan.dto.UpdateSequenceRequest;
import jeju.bear.plan.service.DestinationService;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-days/{dayId}/destinations")
@RequiredArgsConstructor
public class DestinationController {
    private final DestinationService destinationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DestinationDto>>> list(
            @CurrentUser User user,
            @PathVariable Long dayId
    ) {
        List<DestinationDto> destinations = destinationService.getDestinations(dayId, user.getId());
        return ResponseEntity.ok(ApiResponse.onSuccess(destinations));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DestinationDto>> add(
            @CurrentUser User user,
            @PathVariable Long dayId,
            @RequestBody CreateDestinationRequest req
    ) {
        req.setTripDayId(dayId);
        DestinationDto destination = destinationService.addDestination(req, user.getId());
        return ResponseEntity.ok(ApiResponse.onSuccess(destination));
    }

    @PutMapping("/sequence")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> reorder(
            @CurrentUser User user,
            @RequestBody UpdateSequenceRequest req
    ) {
        destinationService.updateSequence(req.getTripDayId(), req.getOrderedDestinationIds(), user.getId());
        return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
    }

    @DeleteMapping("/{destId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> remove(
            @CurrentUser User user,
            @PathVariable Long dayId,
            @PathVariable Long destId
    ) {
        destinationService.removeDestination(dayId, destId, user.getId());
        return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
    }
}

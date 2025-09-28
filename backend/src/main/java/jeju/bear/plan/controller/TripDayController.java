package jeju.bear.plan.controller;

import lombok.RequiredArgsConstructor;
import jeju.bear.plan.dto.AddTripDayRequest;
import jeju.bear.plan.dto.TripDayDto;
import jeju.bear.plan.service.TripDayService;      // 이제 import 가능해집니다
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-plans/{planId}/days")
@RequiredArgsConstructor
public class TripDayController {
    private final TripDayService tripDayService;

    @GetMapping
    public ResponseEntity<List<TripDayDto>> listDays(
            @PathVariable Long planId,
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(tripDayService.getDays(planId, userId));
    }

    @PostMapping
    public ResponseEntity<TripDayDto> addDay(
            @PathVariable Long planId,
            @AuthenticationPrincipal Long userId,
            @RequestBody AddTripDayRequest request
    ) {
        TripDayDto dto = tripDayService.addTripDay(planId, request.getDate(), userId);
        return ResponseEntity.status(201).body(dto);
    }
}

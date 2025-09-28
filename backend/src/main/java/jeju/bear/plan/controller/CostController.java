// src/main/java/com/jeju/bear/plan/controller/CostController.java
package jeju.bear.plan.controller;

import jeju.bear.plan.dto.CostDto;
import jeju.bear.plan.service.CostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-plans/{planId}/costs")
@RequiredArgsConstructor
public class CostController {
    private final CostService costService;

    @GetMapping
    public List<CostDto> getCosts(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long planId
    ) {
        return costService.getCosts(planId, userId);
    }
}

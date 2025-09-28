package jeju.bear.plan.service;

import jeju.bear.plan.dto.CostDto;
import java.util.List;

public interface CostService {
    List<CostDto> getCosts(Long tripPlanId, Long userId);
}
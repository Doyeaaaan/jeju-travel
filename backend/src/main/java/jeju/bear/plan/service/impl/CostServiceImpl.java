package jeju.bear.plan.service.impl;

import jeju.bear.plan.dto.CostDto;
import jeju.bear.plan.repository.CostRepository;
import jeju.bear.plan.repository.TripPlanRepository;
import jeju.bear.plan.service.CostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CostServiceImpl implements CostService {
    private final TripPlanRepository tripPlanRepository;
    private final CostRepository costRepository;

    @Override
    public List<CostDto> getCosts(Long tripPlanId, Long userId) {
        tripPlanRepository.findById(tripPlanId)
                .filter(tp -> tp.getUser().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Invalid TripPlan or access denied"));
        return costRepository.findByTripPlan_TripPlanId(tripPlanId)
                .stream().map(CostDto::from).collect(Collectors.toList());
    }
}
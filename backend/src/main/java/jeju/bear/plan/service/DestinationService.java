package jeju.bear.plan.service;

import jeju.bear.plan.dto.CreateDestinationRequest;  // ← 이 줄을 추가
import jeju.bear.plan.dto.DestinationDto;
import java.util.List;

public interface DestinationService {
    DestinationDto addDestination(CreateDestinationRequest request, Long userId);
    void updateSequence(Long tripDayId, List<Long> orderedDestinationIds, Long userId);
    void removeDestination(Long tripDayId, Long destinationId, Long userId);
    List<DestinationDto> getDestinations(Long tripDayId, Long userId);
}

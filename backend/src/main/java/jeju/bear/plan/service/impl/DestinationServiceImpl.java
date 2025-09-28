package jeju.bear.plan.service.impl;

import jeju.bear.plan.dto.CreateDestinationRequest;
import jeju.bear.plan.dto.DestinationDto;
import jeju.bear.plan.entity.Destination;
import jeju.bear.plan.entity.TripDay;
import jeju.bear.plan.repository.DestinationRepository;
import jeju.bear.plan.repository.TripDayRepository;
import jeju.bear.plan.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DestinationServiceImpl implements DestinationService {
    private final TripDayRepository tripDayRepository;
    private final DestinationRepository destinationRepository;

    @Override
    public DestinationDto addDestination(CreateDestinationRequest req, Long userId) {
        TripDay day = tripDayRepository.findById(req.getTripDayId())
                .orElseThrow(() -> new IllegalArgumentException("TripDay not found"));
        Destination dest = Destination.builder()
                .sequence(req.getSequence())
                .transportation(req.getTransportation() != null ? req.getTransportation() : "")
                .duration(req.getDuration() != null ? req.getDuration() : 0)
                .placeId(req.getPlaceId())
                .placeName(req.getPlaceName() != null ? req.getPlaceName() : "")
                .address(req.getAddress() != null ? req.getAddress() : "")
                .type(req.getType())
                .price(req.getPrice() != null ? req.getPrice() : 0)
                .memo(req.getMemo() != null ? req.getMemo() : "")
                .tripDay(day)
                .build();
        Destination saved = destinationRepository.save(dest);
        return DestinationDto.from(saved);
    }

    @Override
    public List<DestinationDto> getDestinations(Long tripDayId, Long userId) {
        return destinationRepository.findByTripDay_TripDayIdOrderBySequence(tripDayId)
                .stream().map(DestinationDto::from).collect(Collectors.toList());
    }

    @Override
    public void updateSequence(Long tripDayId, List<Long> orderedDestinationIds, Long userId) {
        List<Destination> list = destinationRepository.findByTripDay_TripDayIdOrderBySequence(tripDayId);
        
        for (int i = 0; i < orderedDestinationIds.size(); i++) {
            Long id = orderedDestinationIds.get(i);
            int seq = i + 1;
            
            list.stream()
                    .filter(d -> d.getId().equals(id))
                    .findFirst()
                    .ifPresent(d -> d.setSequence(seq));
        }
        
        destinationRepository.saveAll(list);
    }

    @Override
    public void removeDestination(Long tripDayId, Long destinationId, Long userId) {
        destinationRepository.deleteByTripDay_TripDayIdAndId(tripDayId, destinationId);
    }
}

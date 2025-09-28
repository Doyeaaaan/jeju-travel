package jeju.bear.plan.repository;

import jeju.bear.plan.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByTripDay_TripDayIdOrderBySequence(Long tripDayId);
    void deleteByTripDay_TripDayIdAndId(Long tripDayId, Long destinationId);
    List<Destination> findByTripDay_TripDayId(Long tripDayId);
}
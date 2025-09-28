package jeju.bear.plan.repository;

import jeju.bear.plan.entity.TripDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripDayRepository extends JpaRepository<TripDay, Long> {
    List<TripDay> findByTripPlan_TripPlanIdOrderByDayNumber(Long tripPlanId);
}
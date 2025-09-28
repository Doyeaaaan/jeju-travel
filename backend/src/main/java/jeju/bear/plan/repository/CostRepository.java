package jeju.bear.plan.repository;

import jeju.bear.plan.entity.Cost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CostRepository extends JpaRepository<Cost, Long> {
    List<Cost> findByTripPlan_TripPlanId(Long tripPlanId);
}
package jeju.bear.plan.repository;

import jeju.bear.plan.entity.TripPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripPlanRepository extends JpaRepository<TripPlan, Long> {
    @Query("SELECT tp FROM TripPlan tp LEFT JOIN FETCH tp.days WHERE tp.user.id = :userId ORDER BY tp.tripPlanId DESC")
    List<TripPlan> findByUserId(@Param("userId") Long userId);
}
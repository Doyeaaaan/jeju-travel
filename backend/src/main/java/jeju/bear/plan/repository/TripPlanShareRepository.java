package jeju.bear.plan.repository;

import jeju.bear.plan.entity.TripPlanShare;
import jeju.bear.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripPlanShareRepository extends JpaRepository<TripPlanShare, Long> {
    List<TripPlanShare> findAllBySharedWithUser(User user);
    
    @Query("SELECT s FROM TripPlanShare s WHERE s.tripPlan.tripPlanId = :planId AND s.sharedWithUser.id = :userId")
    Optional<TripPlanShare> findByTripPlanAndUser(@Param("planId") Long planId, @Param("userId") Long userId);
    
    @Query("SELECT s FROM TripPlanShare s WHERE s.tripPlan.tripPlanId = :planId")
    Optional<TripPlanShare> findByTripPlanId(@Param("planId") Long planId);
    
    @Query("DELETE FROM TripPlanShare s WHERE s.tripPlan.tripPlanId = :tripPlanId")
    void deleteAllByTripPlanId(@Param("tripPlanId") Long tripPlanId);
    
    // 수정된 메서드명
    Optional<TripPlanShare> findByTripPlan_TripPlanIdAndSharedWithUserId(Long planId, Long userId);
    
    // 권한 확인을 위한 exists 메서드
    boolean existsByTripPlan_TripPlanIdAndSharedWithUserId(Long planId, Long userId);
} 
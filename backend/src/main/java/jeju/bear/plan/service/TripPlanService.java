package jeju.bear.plan.service;

import jeju.bear.board.dto.PostDto;
import jeju.bear.plan.dto.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TripPlanService {
    TripPlanDto createTripPlan(CreateTripPlanRequest request, Long userId);
    TripPlanDto getTripPlan(Long tripPlanId, Long userId);
    // 이 메서드를 반드시 선언해야 구현체에서 찾아냅니다.
    List<TripDayWithDestinationsDto> getDaysWithDestinations(Long tripPlanId, Long userId);
    List<TripPlanDto> getTripPlansByUserId(Long userId);
    void deleteTripPlan(Long tripPlanId, Long userId);

    @Transactional
    PostDto shareAsPost(Long planId, Long userId, CreatePostRequest request);

    @Transactional
    TripPlanShareDto shareWithFriend(Long planId, Long userId, ShareWithFriendRequest request);

    @Transactional
    TripPlanDto updateVisibility(Long planId, Long userId, boolean isPublic);

    @Transactional(readOnly = true)
    List<TripPlanDto> getSharedPlans(Long userId);
    
    boolean existsById(Long planId);
    boolean hasAccess(Long planId, Long userId);
    boolean isAlreadyShared(Long planId);
    DestinationDto addDestination(Long planId, Long dayId, Long userId, AddDestinationRequest request);
    void removeDestination(Long planId, Long dayId, Long destinationId, Long userId);
    DestinationDto updateDestination(Long planId, Long dayId, Long destinationId, Long userId, UpdateDestinationRequest request);
    void moveDestination(Long planId, Long dayId, Long userId, MoveDestinationRequest request);
}

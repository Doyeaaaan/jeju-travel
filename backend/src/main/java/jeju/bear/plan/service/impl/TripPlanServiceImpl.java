package jeju.bear.plan.service.impl;

import jeju.bear.board.dto.PostDto;
import jeju.bear.board.entity.Post;
import jeju.bear.board.repository.PostRepository;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.plan.dto.*;
import jeju.bear.plan.entity.SharePermission;
import jeju.bear.plan.entity.TripDay;
import jeju.bear.plan.entity.TripPlan;
import jeju.bear.plan.entity.TripPlanShare;
import jeju.bear.plan.entity.Destination;
import jeju.bear.plan.repository.TripPlanRepository;
import jeju.bear.plan.repository.TripPlanShareRepository;
import jeju.bear.plan.repository.TripDayRepository;
import jeju.bear.plan.repository.DestinationRepository;
import jeju.bear.plan.service.TripPlanService;
import jeju.bear.plan.service.DestinationService;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class TripPlanServiceImpl implements TripPlanService {
    private final TripPlanRepository tripPlanRepository;
    private final TripPlanShareRepository tripPlanShareRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final DestinationService destinationService;
    private final TripDayRepository tripDayRepository;
    private final DestinationRepository destinationRepository;

    @Override
    public TripPlanDto createTripPlan(CreateTripPlanRequest request, Long userId) {
        // 1) User 엔티티 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2) 날짜 유효성 검사
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new CustomException(ErrorCode.INVALID_DATE_RANGE);
        }

        // 3) TripPlan 엔티티 생성
        TripPlan plan = TripPlan.builder()
                .planName(request.getPlanName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(user)
                .build();

        // 4) 날짜 수 계산 및 TripDay 생성
        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        IntStream.range(0, totalDays)
                .mapToObj(i -> TripDay.builder()
                        .dayNumber(i + 1)
                        .date(request.getStartDate().plusDays(i))
                        .tripPlan(plan)
                        .build())
                .forEach(plan.getDays()::add);

        // 5) 저장 & DTO 변환
        TripPlan saved = tripPlanRepository.save(plan);
        return TripPlanDto.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TripPlanDto getTripPlan(Long tripPlanId, Long userId) {
        TripPlan plan = tripPlanRepository.findById(tripPlanId)
                .filter(tp -> tp.getUser().getId().equals(userId))
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));
        return TripPlanDto.from(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripDayWithDestinationsDto> getDaysWithDestinations(Long planId, Long userId) {
        try {
            // 1) TripPlan 존재 여부 및 사용자 권한 확인 (소유자 또는 공유된 계획)
            TripPlan plan = tripPlanRepository.findById(planId)
                    .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));
            
            // 소유자인지 확인
            boolean isOwner = plan.getUser().getId().equals(userId);
            
            // 소유자가 아닌 경우 공유 권한 확인
            if (!isOwner) {
                boolean hasSharedAccess = tripPlanShareRepository.existsByTripPlan_TripPlanIdAndSharedWithUserId(planId, userId);
                if (!hasSharedAccess) {
                    throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
                }
            }

            // 3) TripDay와 Destination을 함께 조회하여 N+1 문제 방지
            List<TripDay> days = tripDayRepository.findByTripPlan_TripPlanIdOrderByDayNumber(planId);
            
            return days.stream()
                    .map(day -> {
                        try {
                            // 4) 각 day의 destinations을 안전하게 처리
                            List<DestinationDto> destinations = day.getDestinations() != null 
                                ? day.getDestinations().stream()
                                    .map(DestinationDto::from)
                                    .collect(Collectors.toList())
                                : new ArrayList<>();

                            return TripDayWithDestinationsDto.builder()
                                    .tripDayId(day.getTripDayId())
                                    .dayNumber(day.getDayNumber())
                                    .date(day.getDate())
                                    .destinations(destinations)
                                    .build();
                        } catch (Exception e) {
                            // 5) 개별 day 처리 실패 시 로그 기록하고 빈 목록 반환
                            System.err.println("Error processing day " + day.getDayNumber() + ": " + e.getMessage());
                            return TripDayWithDestinationsDto.builder()
                                    .tripDayId(day.getTripDayId())
                                    .dayNumber(day.getDayNumber())
                                    .date(day.getDate())
                                    .destinations(new ArrayList<>())
                                    .build();
                        }
                    })
                    .collect(Collectors.toList());
        } catch (CustomException e) {
            // 6) 커스텀 예외는 그대로 재발생
            throw e;
        } catch (Exception e) {
            // 7) 예상치 못한 예외는 로그 기록 후 일반적인 서버 에러로 변환
            System.err.println("Unexpected error in getDaysWithDestinations: " + e.getMessage());
            e.printStackTrace();
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripPlanDto> getTripPlansByUserId(Long userId) {
        // 사용자 존재 확인
        if (!userRepository.existsById(userId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // 사용자의 모든 여행 계획 조회
        return tripPlanRepository.findByUserId(userId).stream()
                .map(TripPlanDto::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTripPlan(Long tripPlanId, Long userId) {
        TripPlan tripPlan = tripPlanRepository.findById(tripPlanId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));

        if (!tripPlan.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 여행 계획 삭제 (Cascade로 인해 연관된 TripDay, Destination도 함께 삭제됨)
        tripPlanRepository.delete(tripPlan);
    }

    @Override
    public PostDto shareAsPost(Long planId, Long userId, CreatePostRequest request) {
        TripPlan tripPlan = tripPlanRepository.findById(planId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));

        if (!tripPlan.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .user(user)
                .tripPlan(tripPlan)
                .build();

        Post savedPost = postRepository.save(post);
        return PostDto.from(savedPost);
    }

    @Override
    public TripPlanShareDto shareWithFriend(Long planId, Long userId, ShareWithFriendRequest request) {
        TripPlan tripPlan = tripPlanRepository.findById(planId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));

        if (!tripPlan.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        User friend = userRepository.findById(request.getFriendId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 공유된 경우 체크
        if (tripPlanShareRepository.findByTripPlanAndUser(planId, friend.getId()).isPresent()) {
            throw new CustomException(ErrorCode.ALREADY_SHARED);
        }

        TripPlanShare share = TripPlanShare.builder()
                .tripPlan(tripPlan)
                .sharedWithUser(friend)
                .permission(SharePermission.valueOf(request.getPermission()))
                .build();

        TripPlanShare savedShare = tripPlanShareRepository.save(share);
        return TripPlanShareDto.from(savedShare);
    }

    @Override
    public TripPlanDto updateVisibility(Long planId, Long userId, boolean isPublic) {
        TripPlan tripPlan = tripPlanRepository.findById(planId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_PLAN_NOT_FOUND));

        if (!tripPlan.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        tripPlan.updateVisibility(isPublic);
        return TripPlanDto.from(tripPlan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripPlanDto> getSharedPlans(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<TripPlanShare> shares = tripPlanShareRepository.findAllBySharedWithUser(user);
        return shares.stream()
                .map(share -> {
                    String ownerName = share.getTripPlan().getUser() != null 
                        ? share.getTripPlan().getUser().getNickname() 
                        : "알 수 없음";
                    return TripPlanDto.fromSharedPlan(share.getTripPlan(), ownerName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(Long planId) {
        return tripPlanRepository.existsById(planId);
    }

    @Override
    public boolean hasAccess(Long planId, Long userId) {
        return tripPlanRepository.findById(planId)
                .map(plan -> plan.getUser().getId().equals(userId))
                .orElse(false);
    }

    @Override
    public boolean isAlreadyShared(Long planId) {
        return tripPlanShareRepository.findByTripPlanId(planId).isPresent();
    }

    @Override
    public DestinationDto addDestination(Long planId, Long dayId, Long userId, AddDestinationRequest request) {
        // 1. 권한 확인
        if (!hasAccess(planId, userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. TripDay가 해당 TripPlan에 속하는지 확인
        TripDay tripDay = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_DAY_NOT_FOUND));

        if (!tripDay.getTripPlan().getTripPlanId().equals(planId)) {
            throw new CustomException(ErrorCode.INVALID_TRIP_DAY);
        }

        // 3. CreateDestinationRequest로 변환하여 DestinationService 호출
        CreateDestinationRequest createRequest = CreateDestinationRequest.builder()
                .tripDayId(dayId)
                .placeId(request.getPlaceId())  // String 그대로 사용
                .placeName(request.getPlaceName())  // 장소명 추가
                .address(request.getAddress())  // 주소 추가
                .type(request.getCategory())
                .sequence(tripDay.getDestinations().size() + 1)  // 자동 시퀀스 할당
                .memo(request.getMemo())  // 메모 추가
                .build();

        return destinationService.addDestination(createRequest, userId);
    }

    @Override
    public void removeDestination(Long planId, Long dayId, Long destinationId, Long userId) {
        // 1. 권한 확인
        if (!hasAccess(planId, userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. TripDay가 해당 TripPlan에 속하는지 확인
        TripDay tripDay = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_DAY_NOT_FOUND));

        if (!tripDay.getTripPlan().getTripPlanId().equals(planId)) {
            throw new CustomException(ErrorCode.INVALID_TRIP_DAY);
        }

        // 3. DestinationService를 통해 삭제
        destinationService.removeDestination(dayId, destinationId, userId);
    }

    @Override
    public DestinationDto updateDestination(Long planId, Long dayId, Long destinationId, Long userId, UpdateDestinationRequest request) {
        // 1. 권한 확인
        if (!hasAccess(planId, userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. TripDay가 해당 TripPlan에 속하는지 확인
        TripDay tripDay = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_DAY_NOT_FOUND));

        if (!tripDay.getTripPlan().getTripPlanId().equals(planId)) {
            throw new CustomException(ErrorCode.INVALID_TRIP_DAY);
        }

        // 3. Destination이 존재하는지 확인
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new CustomException(ErrorCode.DESTINATION_NOT_FOUND));

        // 4. Destination이 해당 TripDay에 속하는지 확인
        if (!destination.getTripDay().getTripDayId().equals(dayId)) {
            throw new CustomException(ErrorCode.INVALID_DESTINATION);
        }

        // 5. 정보 업데이트
        destination.updateDetails(
            request.getTransportation(),
            request.getDuration(),
            request.getPrice()
        );

        // 6. 저장 및 DTO 반환
        Destination savedDestination = destinationRepository.save(destination);
        return DestinationDto.from(savedDestination);
    }

    @Override
    public void moveDestination(Long planId, Long dayId, Long userId, MoveDestinationRequest request) {
        // 1. 권한 확인
        if (!hasAccess(planId, userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. TripDay가 해당 TripPlan에 속하는지 확인
        TripDay tripDay = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_DAY_NOT_FOUND));

        if (!tripDay.getTripPlan().getTripPlanId().equals(planId)) {
            throw new CustomException(ErrorCode.INVALID_TRIP_DAY);
        }

        // 3. TripDay의 moveDestination 메서드 사용
        tripDay.moveDestination(request.getFromSequence(), request.getToSequence());

        // 4. 저장
        tripDayRepository.save(tripDay);

        // 5. 시퀀스 변경 완료
        // 시퀀스 변경은 TripDay 엔티티에서 처리됨
    }
}

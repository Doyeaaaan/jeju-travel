package jeju.bear.user.service.impl;

import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.user.dto.FriendRequestDto;
import jeju.bear.user.dto.FriendResponseDto;
import jeju.bear.user.entity.Friend;
import jeju.bear.user.entity.FriendStatus;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.FriendRepository;
import jeju.bear.user.repository.UserRepository;
import jeju.bear.user.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendServiceImpl implements FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @Override
    public void addFriend(User requester, Long targetId) {
        System.out.println("=== 친구 추가 요청 시작 ===");
        System.out.println("요청자 ID: " + requester.getId() + ", 대상 ID: " + targetId);
        
        // 자기 자신에게 친구 요청을 보내는 경우
        if (requester.getId().equals(targetId)) {
            System.out.println("❌ 자기 자신에게 친구 요청 시도");
            throw new CustomException(ErrorCode.INVALID_FRIEND_REQUEST);
        }

        // 대상 사용자 존재 확인
        User receiver = userRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        System.out.println("✅ 대상 사용자 확인: " + receiver.getEmail());

        // 이미 친구인지 확인
        boolean alreadyAccepted1 = friendRepository.existsByRequesterAndReceiverAndStatus(requester, receiver, FriendStatus.ACCEPTED);
        boolean alreadyAccepted2 = friendRepository.existsByRequesterAndReceiverAndStatus(receiver, requester, FriendStatus.ACCEPTED);
        System.out.println("친구 관계 확인 - ACCEPTED: " + alreadyAccepted1 + ", " + alreadyAccepted2);
        
        if (alreadyAccepted1 || alreadyAccepted2) {
            System.out.println("❌ 이미 친구 관계 존재");
            throw new CustomException(ErrorCode.ALREADY_FRIEND);
        }

        // 이미 보낸 요청이 있는지 확인 (PENDING 상태)
        boolean alreadySent = friendRepository.existsByRequesterAndReceiverAndStatus(requester, receiver, FriendStatus.PENDING);
        System.out.println("보낸 요청 확인 - PENDING: " + alreadySent);
        
        if (alreadySent) {
            System.out.println("❌ 이미 보낸 친구 요청 존재");
            throw new CustomException(ErrorCode.DUPLICATE_FRIEND_REQUEST);
        }

        // 이미 받은 요청이 있는지 확인 (PENDING 상태)
        boolean alreadyReceived = friendRepository.existsByRequesterAndReceiverAndStatus(receiver, requester, FriendStatus.PENDING);
        System.out.println("받은 요청 확인 - PENDING: " + alreadyReceived);
        
        if (alreadyReceived) {
            System.out.println("❌ 이미 받은 친구 요청 존재");
            throw new CustomException(ErrorCode.DUPLICATE_FRIEND_REQUEST);
        }

        // 기존에 REJECTED 상태의 친구 관계가 있다면 삭제
        List<Friend> existingRejected = friendRepository.findAllByRequesterAndStatus(requester, FriendStatus.REJECTED);
        existingRejected.addAll(friendRepository.findAllByRequesterAndStatus(receiver, FriendStatus.REJECTED));
        
        // 양방향 관계에서 REJECTED 상태인 것들만 필터링
        existingRejected = existingRejected.stream()
                .filter(friend -> (friend.getRequester().equals(requester) && friend.getReceiver().equals(receiver)) ||
                                 (friend.getRequester().equals(receiver) && friend.getReceiver().equals(requester)))
                .collect(Collectors.toList());
        
        if (!existingRejected.isEmpty()) {
            System.out.println("🗑️ REJECTED 상태 친구 관계 삭제: " + existingRejected.size() + "개");
            friendRepository.deleteAll(existingRejected);
        }

        Friend friendRequest = Friend.builder()
                .requester(requester)
                .receiver(receiver)
                .status(FriendStatus.PENDING)
                .build();

        friendRepository.save(friendRequest);
        System.out.println("✅ 새로운 친구 요청 생성 완료");
        System.out.println("=== 친구 추가 요청 종료 ===");
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendResponseDto> getFriendList(User user) {
        // 사용자가 요청자인 경우와 수신자인 경우 모두 조회
        List<Friend> friendsAsRequester = friendRepository.findAllByRequesterAndStatus(user, FriendStatus.ACCEPTED);
        List<Friend> friendsAsReceiver = friendRepository.findAllByReceiverAndStatus(user, FriendStatus.ACCEPTED);
        
        List<Friend> allFriends = new ArrayList<>();
        allFriends.addAll(friendsAsRequester);
        allFriends.addAll(friendsAsReceiver);

        System.out.println("🔍 친구 목록 조회 - 사용자 ID: " + user.getId());
        System.out.println("  - 요청자로서의 친구 수: " + friendsAsRequester.size());
        System.out.println("  - 수신자로서의 친구 수: " + friendsAsReceiver.size());
        System.out.println("  - 총 친구 수: " + allFriends.size());

        return allFriends.stream()
                .map(friend -> {
                    User friendUser = friend.getRequester().equals(user) ? 
                            friend.getReceiver() : friend.getRequester();
                    return FriendResponseDto.from(friendUser, friend);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendRequestDto> getReceivedRequests(User user) {
        return friendRepository.findAllByReceiverAndStatus(user, FriendStatus.PENDING)
                .stream()
                .map(FriendRequestDto::fromReceived)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendRequestDto> getSentRequests(User user) {
        return friendRepository.findAllByRequesterAndStatus(user, FriendStatus.PENDING)
                .stream()
                .map(FriendRequestDto::fromSent)
                .collect(Collectors.toList());
    }

    @Override
    public void acceptRequest(User user, Long requestId) {
        Friend request = friendRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 요청을 받은 사용자만 수락할 수 있음 (임시로 주석 처리)
        // if (!request.getReceiver().equals(user)) {
        //     throw new CustomException(ErrorCode.UNAUTHORIZED_FRIEND_REQUEST);
        // }

        // PENDING 상태인 요청만 수락 가능
        if (request.getStatus() != FriendStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_FRIEND_REQUEST_STATUS);
        }

        // 1. 기존 요청을 ACCEPTED로 변경
        request.accept();
        
        // 2. 반대 방향 관계도 생성 (양방향 친구 관계)
        Friend reverseFriend = Friend.builder()
                .requester(request.getReceiver())  // 원래 수신자가 요청자가 됨
                .receiver(request.getRequester())  // 원래 요청자가 수신자가 됨
                .status(FriendStatus.ACCEPTED)
                .build();
        
        friendRepository.save(reverseFriend);
        
        System.out.println("✅ 양방향 친구 관계 생성 완료:");
        System.out.println("  - 원래 관계: " + request.getRequester().getId() + " → " + request.getReceiver().getId());
        System.out.println("  - 반대 관계: " + reverseFriend.getRequester().getId() + " → " + reverseFriend.getReceiver().getId());
    }

    @Override
    public void rejectRequest(User user, Long requestId) {
        Friend request = friendRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 요청을 받은 사용자만 거절할 수 있음 (임시로 주석 처리)
        // if (!request.getReceiver().equals(user)) {
        //     throw new CustomException(ErrorCode.UNAUTHORIZED_FRIEND_REQUEST);
        // }

        // PENDING 상태인 요청만 거절 가능
        if (request.getStatus() != FriendStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_FRIEND_REQUEST_STATUS);
        }

        friendRepository.delete(request);
    }

    @Override
    public void cancelRequest(User user, Long requestId) {
        Friend request = friendRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 요청을 보낸 사용자만 취소할 수 있음
        if (!request.getRequester().equals(user)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_FRIEND_REQUEST);
        }

        // PENDING 상태인 요청만 취소 가능
        if (request.getStatus() != FriendStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_FRIEND_REQUEST_STATUS);
        }

        friendRepository.delete(request);
    }

    @Override
    public void deleteFriend(User user, Long friendId) {
        System.out.println("=== 친구 삭제 요청 시작 ===");
        System.out.println("요청 사용자 ID: " + user.getId() + ", 친구 관계 ID: " + friendId);
        
        // 친구 관계 존재 확인
        Friend friendship = friendRepository.findById(friendId)
                .orElseThrow(() -> {
                    System.out.println("❌ 친구 관계를 찾을 수 없음 - ID: " + friendId);
                    return new CustomException(ErrorCode.FRIEND_NOT_FOUND);
                });
        
        System.out.println("✅ 친구 관계 확인됨:");
        System.out.println("  - 친구 관계 ID: " + friendship.getId());
        System.out.println("  - 요청자 ID: " + friendship.getRequester().getId());
        System.out.println("  - 수신자 ID: " + friendship.getReceiver().getId());
        System.out.println("  - 상태: " + friendship.getStatus());

        // ACCEPTED 상태인 친구 관계만 삭제 가능
        if (friendship.getStatus() != FriendStatus.ACCEPTED) {
            System.out.println("❌ ACCEPTED 상태가 아닌 친구 관계 - 상태: " + friendship.getStatus());
            throw new CustomException(ErrorCode.INVALID_FRIEND_REQUEST_STATUS);
        }

        // 권한 검증: 관리자이거나 친구 관계의 당사자인 경우만 삭제 가능
        boolean isAdmin = "ADMIN".equals(user.getRole().name());
        boolean isRequester = friendship.getRequester().getId().equals(user.getId());
        boolean isReceiver = friendship.getReceiver().getId().equals(user.getId());
        boolean isParticipant = isRequester || isReceiver;
        
        System.out.println("=== 권한 검증 상세 정보 ===");
        System.out.println("  - 친구 관계 ID: " + friendId);
        System.out.println("  - 요청자 ID: " + friendship.getRequester().getId());
        System.out.println("  - 수신자 ID: " + friendship.getReceiver().getId());
        System.out.println("  - 현재 사용자 ID: " + user.getId());
        System.out.println("  - 관리자 여부: " + isAdmin);
        System.out.println("  - 요청자 여부: " + isRequester);
        System.out.println("  - 수신자 여부: " + isReceiver);
        System.out.println("  - 참여자 여부: " + isParticipant);
        
        if (!isAdmin && !isParticipant) {
            System.out.println("❌ 권한 없음 - 사용자 ID: " + user.getId() + "는 친구 관계의 당사자가 아님");
            throw new CustomException(ErrorCode.UNAUTHORIZED_FRIEND_REQUEST);
        }

        // 양방향 친구 관계 모두 삭제
        User otherUser = friendship.getRequester().equals(user) ? 
                friendship.getReceiver() : friendship.getRequester();
        
        // 1. 현재 친구 관계 삭제
        friendRepository.delete(friendship);
        
        // 2. 반대 방향 친구 관계도 삭제
        List<Friend> reverseFriendships = friendRepository.findAllByRequesterAndReceiverAndStatus(
                otherUser, user, FriendStatus.ACCEPTED);
        
        if (!reverseFriendships.isEmpty()) {
            friendRepository.deleteAll(reverseFriendships);
            System.out.println("✅ 반대 방향 친구 관계도 삭제 완료: " + reverseFriendships.size() + "개");
        }
        
        System.out.println("✅ 양방향 친구 관계 삭제 완료");
        System.out.println("=== 친구 삭제 요청 종료 ===");
    }

    @Override
    public Object searchFriendsByNickname(User user, String nickname) {
        // 닉네임으로 친구 검색 (이미 친구인 사용자들 중에서)
        List<FriendResponseDto> friends = getFriendList(user);
        
        return friends.stream()
                .filter(friend -> friend.getNickname().toLowerCase().contains(nickname.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    public Object getFriendRecommendations(User user) {
        // 친구 추천 (임시로 모든 사용자 중에서 친구가 아닌 사용자들을 반환)
        List<User> allUsers = userRepository.findAll();
        List<FriendResponseDto> currentFriends = getFriendList(user);
        
        Set<Long> friendIds = currentFriends.stream()
                .map(FriendResponseDto::getUserId)
                .collect(Collectors.toSet());
        
        return allUsers.stream()
                .filter(u -> !u.getId().equals(user.getId()) && !friendIds.contains(u.getId()))
                .limit(10) // 임시로 10명만 반환
                .map(u -> FriendResponseDto.builder()
                        .friendId(u.getId())
                        .userId(u.getId())
                        .nickname(u.getNickname())
                        .profileImage(u.getProfileImage())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Object getShareableFriends(User user) {
        // 공유 가능한 친구 목록 (이미 친구인 사용자들)
        return getFriendList(user);
    }
} 
package jeju.bear.user.service;

import jeju.bear.user.dto.FriendRequestDto;
import jeju.bear.user.dto.FriendResponseDto;
import jeju.bear.user.entity.User;

import java.util.List;

public interface FriendService {

    void addFriend(User user, Long targetId);

    List<FriendResponseDto> getFriendList(User user);

    List<FriendRequestDto> getReceivedRequests(User user);

    List<FriendRequestDto> getSentRequests(User user);

    void acceptRequest(User user, Long requestId);

    void rejectRequest(User user, Long requestId);

    void cancelRequest(User user, Long requestId);

    void deleteFriend(User user, Long friendId);

    // 새로 추가된 메서드들
    Object searchFriendsByNickname(User user, String nickname);
    
    Object getFriendRecommendations(User user);
    
    Object getShareableFriends(User user);
}

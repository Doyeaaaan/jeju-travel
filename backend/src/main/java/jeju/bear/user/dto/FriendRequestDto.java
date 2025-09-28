package jeju.bear.user.dto;

import jeju.bear.user.entity.Friend;
import jeju.bear.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class FriendRequestDto {

    private Long requestId;

    private Long userId;

    private String nickname;

    private String profileImage;

    private LocalDateTime requestedAt;

    @Builder
    public FriendRequestDto(Long requestId, Long userId, String nickname, LocalDateTime requestedAt, String profileImage) {
        this.requestId = requestId;
        this.userId = userId;
        this.nickname = nickname;
        this.requestedAt = requestedAt;
        this.profileImage = profileImage;
    }

    public static FriendRequestDto from(Friend friend) {
        User targetUser = friend.getRequester(); // 기본적으로 요청자 정보를 사용

        return FriendRequestDto.builder()
                .requestId(friend.getId())
                .userId(targetUser.getId())
                .nickname(targetUser.getNickname())
                .profileImage(targetUser.getProfileImage())
                .requestedAt(friend.getRequestedAt())
                .build();
    }

    public static FriendRequestDto fromReceived(Friend friend) {
        return FriendRequestDto.builder()
                .requestId(friend.getId())
                .userId(friend.getRequester().getId())
                .nickname(friend.getRequester().getNickname())
                .profileImage(friend.getRequester().getProfileImage())
                .requestedAt(friend.getRequestedAt())
                .build();
    }

    public static FriendRequestDto fromSent(Friend friend) {
        return FriendRequestDto.builder()
                .requestId(friend.getId())
                .userId(friend.getReceiver().getId())
                .nickname(friend.getReceiver().getNickname())
                .profileImage(friend.getReceiver().getProfileImage())
                .requestedAt(friend.getRequestedAt())
                .build();
    }
}

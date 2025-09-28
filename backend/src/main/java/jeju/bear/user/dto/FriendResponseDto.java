package jeju.bear.user.dto;

import jeju.bear.user.entity.Friend;
import jeju.bear.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
public class FriendResponseDto {

    private Long friendId;

    private Long userId;

    private String nickname;

    private String profileImage;

    @Builder
    public FriendResponseDto(Long friendId, Long userId, String nickname, String profileImage) {
        this.friendId = friendId;
        this.userId = userId;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public FriendResponseDto(Long friendId, User user) {
        this.friendId = friendId;
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
    }

    public static FriendResponseDto from(User user, Friend friend) {
        return FriendResponseDto.builder()
                .friendId(friend.getId())
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
    }

}

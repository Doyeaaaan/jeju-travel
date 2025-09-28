package jeju.bear.user.dto;

import jeju.bear.board.dto.CommentResponseDto;
import jeju.bear.place.dto.FavoriteDto;
import jeju.bear.place.entity.Favorite;
import jeju.bear.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class MypageResponseDto {

    private String email; // 필요한가??

    private String nickname;

    private String profileImage;

    private List<MypagePostDto> posts;

    private List<CommentResponseDto> comments;

    private List<FavoriteDto> favorites;

    private List<FriendResponseDto> friends;

    @Builder
    public MypageResponseDto(String email, String nickname, String profileImage, List<MypagePostDto> posts, List<CommentResponseDto> comments, List<FavoriteDto> favorites, List<FriendResponseDto> friends) {
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.posts = posts;
        this.comments = comments;
        this.favorites = favorites;
        this.friends = friends;
    }

    public MypageResponseDto(User user) {
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.posts = null; // 나중에 서비스에서 설정
        this.comments = null; // 나중에 서비스에서 설정
        this.favorites = null; // 나중에 서비스에서 설정
        this.friends = null; // 나중에 서비스에서 설정
    }

}

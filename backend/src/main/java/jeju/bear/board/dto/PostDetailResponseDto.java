package jeju.bear.board.dto;

import jeju.bear.board.entity.Comment;
import jeju.bear.board.entity.Image;
import jeju.bear.board.entity.Post;
import jeju.bear.user.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PostDetailResponseDto {

    private String title;

    private List<ImageResponseDto> images;

    private String content;

    private Long userId;

    private String nickname;

    private String profileImage;

    private LocalDateTime createdAt;

    private int like;

    private List<CommentResponseDto> comments = new ArrayList<>();

    private boolean isWriter;

    private boolean isLiked;

    public PostDetailResponseDto(Post post, boolean isWriter, boolean isLiked, User user) {
        this.title = post.getTitle();
        this.images = post.getImages().stream().map(ImageResponseDto::new).collect(Collectors.toList());
        this.content = post.getContent();
        this.userId = post.getUser().getId();
        this.nickname = post.getUser().getNickname();
        this.profileImage = post.getUser().getProfileImage();
        this.createdAt = post.getCreatedAt();
        this.like = post.getPostLikes().size();
        this.comments = post.getComments().stream().map(comment -> new CommentResponseDto(comment, user)).collect(Collectors.toList());
        this.isWriter = isWriter;
        this.isLiked = isLiked;
    }

}

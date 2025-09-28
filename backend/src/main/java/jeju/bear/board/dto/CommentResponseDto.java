package jeju.bear.board.dto;

import jeju.bear.board.entity.Comment;
import jeju.bear.user.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDto {

    private Long id;

    private Long userId;

    private String nickname;

    private String profileImage;

    private String content;

    private LocalDateTime createdAt;

    private boolean isWriter;

    private Long postId;

    private String postTitle;

    public CommentResponseDto(Comment comment, User user) {
        this.id = comment.getId();
        this.userId = comment.getUser().getId();
        this.nickname = comment.getUser().getNickname();
        this.profileImage = comment.getUser().getProfileImage();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.postId = comment.getPost().getId();
        this.postTitle = comment.getPost().getTitle();
        if(user != null) {
            this.isWriter = userId.equals(user.getId());
        } else {
            this.isWriter = false;
        }
    }

}

package jeju.bear.board.dto;

import jeju.bear.board.entity.Post;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PostResponseDto {

    private Long id;

    private String title;

    private LocalDateTime createdAt;

    private int like;

    private int views;

    private int commentCount;

    private boolean hasImage;

    public PostResponseDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.createdAt = post.getCreatedAt();
        this.like = post.getPostLikes().size();
        this.views = post.getViews();
        this.commentCount = post.getComments().size();
        this.hasImage = post.getImages().size() > 0;
    }

}

package jeju.bear.user.dto;

import jeju.bear.board.dto.ImageResponseDto;
import jeju.bear.board.entity.Post;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class MypagePostDto {

    private Long id;

    private String title;

    private String content;

    private LocalDateTime createdAt;

    private int like;

    private int commentCount;

    private List<ImageResponseDto> images;

    public MypagePostDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt();
        this.like = post.getPostLikes().size();
        this.commentCount = post.getComments().size();
        this.images = post.getImages().stream().map(ImageResponseDto::new).collect(Collectors.toList());
    }

}

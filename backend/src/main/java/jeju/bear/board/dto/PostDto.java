package jeju.bear.board.dto;

import jeju.bear.board.entity.Post;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private String nickname;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;
    private Long likeCount;
    private Long commentCount;
    private boolean isLiked;

    public static PostDto from(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .nickname(post.getUser().getNickname())
                .userId(post.getUser().getId())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                        .imageUrls(post.getImages().stream().map(image -> image.getUrl()).toList())
                .likeCount((long) post.getPostLikes().size())
                .commentCount((long) post.getComments().size())
                .isLiked(false) // 기본값
                .build();
    }
} 
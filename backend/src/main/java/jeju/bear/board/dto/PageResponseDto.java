package jeju.bear.board.dto;

import jeju.bear.board.entity.Post;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PageResponseDto {

    private int currentPage;

    private int totalPages;

    private long totalElements;

    private List<PostResponseDto> posts;

    public PageResponseDto(Page<Post> page, int currentPage) {
        this.currentPage = currentPage;
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.posts = page.getContent().stream().map(PostResponseDto::new).collect(Collectors.toList());
    }

}

package jeju.bear.board.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PostUpdateDto {

    private String title;

    private String content;

    private Long planId;

    private List<Long> deleteImages;

}

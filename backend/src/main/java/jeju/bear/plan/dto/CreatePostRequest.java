package jeju.bear.plan.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreatePostRequest {
    private String title;
    private String content;
    private boolean isPublic;
} 
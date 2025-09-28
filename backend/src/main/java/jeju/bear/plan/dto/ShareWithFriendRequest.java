package jeju.bear.plan.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShareWithFriendRequest {
    private Long friendId;
    private String permission; // READ, WRITE, ADMIN
} 
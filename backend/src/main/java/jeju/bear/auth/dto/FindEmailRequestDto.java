package jeju.bear.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FindEmailRequestDto {
    private String name;
    private String phoneNumber;
} 
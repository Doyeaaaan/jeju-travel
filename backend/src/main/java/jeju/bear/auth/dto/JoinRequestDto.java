package jeju.bear.auth.dto;

import lombok.Getter;

@Getter
public class JoinRequestDto {

    private String email;

    private String password;

    private String nickname;

}

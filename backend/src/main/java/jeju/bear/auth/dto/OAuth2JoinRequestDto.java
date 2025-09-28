package jeju.bear.auth.dto;

import lombok.Getter;

@Getter
public class OAuth2JoinRequestDto {

    private String email;

    private String nickname;

    private String code;

}

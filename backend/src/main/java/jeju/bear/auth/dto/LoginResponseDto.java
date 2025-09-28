package jeju.bear.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {

    private String grantType;

    private String accessToken;

    private Long accessTokenExpirationTime;

    private String refreshToken;

    private Long refreshTokenExpirationTime;

}

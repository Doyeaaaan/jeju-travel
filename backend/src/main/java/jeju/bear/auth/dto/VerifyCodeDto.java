package jeju.bear.auth.dto;

import lombok.Getter;

@Getter
public class VerifyCodeDto {

    private String email;

    private String code;

}

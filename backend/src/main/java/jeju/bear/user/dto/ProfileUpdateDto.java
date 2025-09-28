package jeju.bear.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateDto {

    private String nickname;

    private String password;

    private boolean deleteProfileImage;

}

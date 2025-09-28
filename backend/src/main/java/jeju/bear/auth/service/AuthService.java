package jeju.bear.auth.service;

import jeju.bear.auth.dto.JoinRequestDto;
import jeju.bear.auth.dto.LoginRequestDto;
import jeju.bear.auth.dto.LoginResponseDto;
import jeju.bear.auth.dto.VerifyCodeDto;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    void join(JoinRequestDto joinRequestDto, MultipartFile image);

    LoginResponseDto login(LoginRequestDto loginRequestDto);

    void checkEmailDuplicate(String email);

    void sendEmailVerifyCode(String email);

    void verifyCode(VerifyCodeDto dto);

    void requestTempPassword(String email);

    void sendFindIdEmail(String email);
    
    void changePasswordByEmail(String email, String verificationCode, String newPassword);
    
    // 비밀번호 찾기용 이메일 인증 코드 발송
    void sendPasswordResetCode(String email);
}

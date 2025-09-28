package jeju.bear.global.email;

import java.time.Duration;

public interface EmailService {
    void sendVerificationEmail(String to, String code);
    void sendPasswordResetEmail(String to, String resetLink);
    void sendEmail(String to, String subject, String content);
    void sendFindIdEmail(String to);
    void sendVerifyCode(String to, String code);
    void saveEmailCode(String email, String code, Duration duration);
    String getEmailCode(String email);
    void saveVerifiedEmail(String email, Duration duration);
    boolean isVerified(String email);
    void sendTempPassword(String to, String tempPassword);
    
    boolean isEmailVerified(String email);
    
    // 비밀번호 찾기용 인증 코드 발송
    void sendPasswordResetCode(String email);
} 
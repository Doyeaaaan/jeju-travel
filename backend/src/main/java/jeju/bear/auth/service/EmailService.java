package jeju.bear.auth.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JavaMailSender javaMailSender;

    private static final String VERIFY_CODE_TITLE = "[재곰제곰] Email Verification Code";
    private static final String TEMP_PW_TITLE = "[재곰제곰] 임시 비밀번호입니다.";
    private static final String VERIFY_CODE_PREFIX = "재곰제곰 이메일 인증 코드입니다. 코드는 5분간 유효합니다.\n\n";
    private static final String TEMP_PW_PREFIX = "재곰제곰 임시 비밀번호입니다. 반드시 비밀번호를 재설정해주세요.\n\n";
    private static final String REDIS_PREFIX = "email_verification:";

    public void sendVerifyCode(String email, String code) {
        sendEmail(VERIFY_CODE_TITLE, VERIFY_CODE_PREFIX, email, code);
    }

    public void sendTempPassword(String email, String password) {
        sendEmail(TEMP_PW_TITLE, TEMP_PW_PREFIX, email, password);
    }

    private void sendEmail(String title, String prefix, String email, String code) {
        String text = prefix + code;
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            // 표시명 + 발신자 주소 설정
            messageHelper.setFrom(new InternetAddress("jiyun12112@gmail.com", "재곰제곰"));
            messageHelper.setTo(email);
            messageHelper.setSubject(title);
            messageHelper.setText(text, false);

            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "이메일 인증 오류");
        }
    }


//    public void sendEmail(String email, String code) {
//        String text = TEXT_PREFIX + code;
//        SimpleMailMessage emailForm = createEmailForm(email, text);
//        try {
//            javaMailSender.send(emailForm);
//        } catch (Exception e) {
//            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "이메일 인증 오류");
//        }
//    }
//    private SimpleMailMessage createEmailForm(String email, String text) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(email);
//        message.setSubject(TITLE);
//        message.setText(text);
//        return message;
//    }

    public void saveEmailCode(String email, String code, Duration ttl) {
        redisTemplate.opsForValue().set(REDIS_PREFIX + email, code, ttl);
    }

    public String getEmailCode(String email) {
        return redisTemplate.opsForValue().get(REDIS_PREFIX + email);
    }

    public void saveVerifiedEmail(String email, Duration ttl) {
        redisTemplate.opsForValue().set("verified_email:" + email, "true", ttl);
    }

    public boolean isVerified(String email) {
        return redisTemplate.opsForValue().get("verified_email:" + email) != null;
    }

}

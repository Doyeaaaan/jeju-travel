package jeju.bear.global.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Slf4j
@RequiredArgsConstructor
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[제주베어] 이메일 인증 코드");
        message.setText("인증 코드: " + code);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[제주베어] 비밀번호 재설정");
        message.setText("비밀번호 재설정 링크: " + resetLink);
        mailSender.send(message);
    }

    @Override
    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendFindIdEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[제주베어] 아이디 찾기");
        message.setText("가입하신 이메일: " + to);
        mailSender.send(message);
    }

    @Override
    public void sendVerifyCode(String to, String code) {
        log.info("📧 이메일 발송 시도: to={}, code={}", to, code);
        sendVerificationEmail(to, code);
    }

    @Override
    public void saveEmailCode(String email, String code, Duration duration) {
        String key = "email:code:" + email;
        log.info("📧 Redis에 이메일 코드 저장 시도: key={}, code={}, duration={}", key, code, duration);
        redisTemplate.opsForValue().set(key, code, duration);
        log.info("✅ Redis에 이메일 코드 저장 완료: key={}", key);
    }

    @Override
    public String getEmailCode(String email) {
        String key = "email:code:" + email;
        String code = redisTemplate.opsForValue().get(key);
        log.info("🔍 Redis에서 이메일 코드 조회: key={}, code={}", key, code);
        return code;
    }

    @Override
    public void saveVerifiedEmail(String email, Duration duration) {
        String key = "email:verified:" + email;
        redisTemplate.opsForValue().set(key, "true", duration);
    }

    @Override
    public boolean isVerified(String email) {
        String key = "email:verified:" + email;
        String verified = redisTemplate.opsForValue().get(key);
        return "true".equals(verified);
    }

    @Override
    public void sendTempPassword(String to, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[제주베어] 임시 비밀번호");
        message.setText("임시 비밀번호: " + tempPassword + "\n로그인 후 비밀번호를 변경해주세요.");
        mailSender.send(message);
    }
    
    @Override
    public boolean isEmailVerified(String email) {
        return redisTemplate.hasKey("verified_email:" + email);
    }
    
    /**
     * 6자리 숫자 인증 코드 생성
     */
    private String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        
        return code.toString();
    }
    
    @Override
    public void sendPasswordResetCode(String email) {
        // 1. 6자리 인증 코드 생성
        String code = generateVerificationCode();
        
        // 2. Redis에 인증 코드 저장 (10분 유효)
        Duration duration = Duration.ofMinutes(10);
        saveEmailCode(email, code, duration);
        
        // 3. 이메일 발송
        sendVerificationEmail(email, code);
        
        log.info("✅ 비밀번호 찾기용 이메일 인증 코드 발송 완료: email={}, code={}", email, code);
    }
} 
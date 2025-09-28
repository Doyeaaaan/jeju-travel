package jeju.bear.auth.service;

import jeju.bear.auth.dto.LoginResponseDto;
import jeju.bear.auth.dto.VerifyCodeDto;
import jeju.bear.auth.model.PrincipalDetails;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.auth.dto.JoinRequestDto;
import jeju.bear.auth.dto.LoginRequestDto;
import jeju.bear.global.email.EmailService;
import jeju.bear.global.jwt.JwtTokenProvider;
import jeju.bear.global.s3.S3Service;
import jeju.bear.user.entity.Role;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Optional;
import java.util.Random;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final S3Service s3Service;

    @Value("${spring.jwt.access-token.expiration-time}")
    private long accessTokenExpirationMs;

    @Value("${spring.jwt.refresh-token.expiration-time}")
    private long refreshTokenExpirationMs;

    @Value("${spring.mail.code.expiration-time}")
    private long emailCodeExpirationMs;

    @Value("${spring.mail.expiration-time}")
    private long verifiedEmailExpirationMs;

    @Value("${temp-password-length}")
    private int tempPasswordLength;

    @Override
    public void join(JoinRequestDto dto, MultipartFile image) {
        if(!emailService.isVerified(dto.getEmail())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "인증된 이메일이 아닙니다.");
        }
        if(userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new CustomException(ErrorCode.EMAIL_CONFLICT);
        }
        if(userRepository.findByNickname(dto.getNickname()).isPresent()) {
            throw new CustomException(ErrorCode.NAME_CONFLICT);
        }

        String profileImageUrl = null;
        if (image != null && !image.isEmpty()) {
            profileImageUrl = s3Service.uploadFile(image);
        }

        User user = User.builder()
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .password(passwordEncoder.encode(dto.getPassword()))
                .profileImage(profileImageUrl)
                .role(Role.ROLE_USER)
                .build();

        //User user = new User(dto, passwordEncoder.encode(dto.getPassword()));
        userRepository.save(user);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto dto) {
        log.info("🔑 로그인 시도: email={}", dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.LOGIN_FAIL));

        log.info("👤 조회된 사용자: id={}, email={}, nickname={}", user.getId(), user.getEmail(), user.getNickname());

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            log.error("❌ 비밀번호 불일치: email={}", dto.getEmail());
            throw new CustomException(ErrorCode.LOGIN_FAIL);
        }

        log.info("✅ 로그인 성공: id={}, email={}", user.getId(), user.getEmail());

        // jwt 생성
        PrincipalDetails principalDetails = new PrincipalDetails(user);
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(principalDetails, null, principalDetails.getAuthorities());
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // redis에 refreshToken 저장
        refreshTokenService.saveRefreshToken(user.getId().toString(), refreshToken, Duration.ofMillis(refreshTokenExpirationMs));

        return new LoginResponseDto(
                "Bearer",
                accessToken,
                accessTokenExpirationMs,
                refreshToken,
                refreshTokenExpirationMs
        );
    }

    @Override
    public void checkEmailDuplicate(String email) {
        if(userRepository.findByEmail(email).isPresent()) {
            throw new CustomException(ErrorCode.EMAIL_CONFLICT);
        }
    }

    // 이메일 보내고 redis에 코드 저장
    @Override
    public void sendEmailVerifyCode(String email) {
        String code = createCode();
        emailService.sendVerifyCode(email, code);
        emailService.saveEmailCode(email, code, Duration.ofMillis(emailCodeExpirationMs));
    }

    private String createCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000)); // 빈자리를 0으로 채우고 총 6자리, decimal
    }

    // 코드 유효하면 redis에 이메일 저장
    @Override
    public void verifyCode(VerifyCodeDto dto) {
        log.info("🔍 AuthService.verifyCode 호출: email={}, code={}", dto.getEmail(), dto.getCode());
        
        String savedCode = emailService.getEmailCode(dto.getEmail());
        log.info("🔍 Redis에서 가져온 코드: email={}, savedCode={}", dto.getEmail(), savedCode);
        
        if(savedCode == null || !savedCode.equals(dto.getCode())) {
            log.error("코드 불일치: email={}, 입력코드={}, 저장된코드={}", dto.getEmail(), dto.getCode(), savedCode);
            throw new CustomException(ErrorCode.BAD_REQUEST, "이메일 또는 코드가 유효하지 않습니다.");
        }

        log.info("코드 일치 확인: email={}, code={}", dto.getEmail(), dto.getCode());
        emailService.saveVerifiedEmail(dto.getEmail(), Duration.ofDays(verifiedEmailExpirationMs));
        log.info("인증된 이메일 Redis에 저장 완료: email={}", dto.getEmail());
    }

    @Override
    public void requestTempPassword(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        User user = userOptional.get();
        if(user.getProvider() != null) {
            throw new CustomException(ErrorCode.FORBIDDEN, "소셜 로그인 사용자는 임시 비밀번호 발급이 불가능합니다.");
        }

        String tempPassword = generateTempPassword(tempPasswordLength);

        emailService.sendTempPassword(email, tempPassword);
        user.updatePassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
    }

    private String generateTempPassword(int length) {
        String charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(charSet.length());
            password.append(charSet.charAt(randomIndex));
        }

        return password.toString();
    }

    @Override
    public void changePasswordByEmail(String email, String verificationCode, String newPassword) {
        // 1. 사용자 존재 여부 확인
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND, "존재하지 않는 사용자입니다.");
        }

        User user = userOptional.get();
        
        // 2. 소셜 로그인 사용자 체크
        if (user.getProvider() != null) {
            throw new CustomException(ErrorCode.FORBIDDEN, "소셜 로그인 사용자는 비밀번호 변경이 불가능합니다.");
        }

        // 3. 이메일 인증 코드 확인 (Redis에서 검증)
        String storedCode = emailService.getEmailCode(email);
        if (storedCode == null || !storedCode.equals(verificationCode)) {
            throw new CustomException(ErrorCode.FORBIDDEN, "인증 코드가 일치하지 않거나 만료되었습니다.");
        }

        // 4. 새 비밀번호로 변경
        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("이메일 인증을 통한 비밀번호 변경 완료: email={}", email);
    }

    @Override
    public void sendFindIdEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND, "해당 이메일로 가입된 사용자가 없습니다.");
        }

        User user = userOptional.get();
        if(user.getProvider() != null) {
            throw new CustomException(ErrorCode.FORBIDDEN, "소셜 로그인 사용자는 이메일 찾기가 불가능합니다.");
        }

        emailService.sendFindIdEmail(email);
    }

    @Override
    public void sendPasswordResetCode(String email) {
        // 1. 사용자 존재 여부 확인 (기존 사용자만)
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND, "해당 이메일로 가입된 사용자가 없습니다.");
        }

        User user = userOptional.get();
        
        // 2. 소셜 로그인 사용자 체크
        if (user.getProvider() != null) {
            throw new CustomException(ErrorCode.FORBIDDEN, "소셜 로그인 사용자는 비밀번호 찾기를 사용할 수 없습니다.");
        }

        // 3. 비밀번호 찾기용 인증 코드 발송
        emailService.sendPasswordResetCode(email);
        
        log.info("비밀번호 찾기용 이메일 인증 코드 발송 완료: email={}", email);
    }

}

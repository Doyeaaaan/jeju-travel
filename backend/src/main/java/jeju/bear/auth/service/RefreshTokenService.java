package jeju.bear.auth.service;

import jeju.bear.auth.dto.LoginResponseDto;
import jeju.bear.auth.model.PrincipalDetails;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.global.jwt.JwtTokenProvider;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    // key: user_id

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${spring.jwt.access-token.expiration-time}")
    private long accessTokenExpirationMs;

    @Value("${spring.jwt.refresh-token.expiration-time}")
    private long refreshTokenExpirationMs;

    private String PREFIX = "refresh_token:";

    public void saveRefreshToken(String key, String refreshToken, Duration ttl) {
        redisTemplate.opsForValue().set(PREFIX + key, refreshToken, ttl);
    }

    public String getRefreshToken(String key) {
        return redisTemplate.opsForValue().get(PREFIX + key);
    }

    public void deleteRefreshToken(String key) {
        redisTemplate.delete(PREFIX + key);
    }

    public LoginResponseDto reissueAccessToken(String refreshToken) {

        // 유효성 검사
        if(!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다.");
            //throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        // Redis에 저장된 리프레시 토큰과 비교
        String key = jwtTokenProvider.getSubjectFromRefreshToken(refreshToken);
        String storedRefreshToken = getRefreshToken(PREFIX + key);
        if(!refreshToken.equals(storedRefreshToken)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 일치하지 않습니다.");
            //throw new IllegalArgumentException("리프레시 토큰이 일치하지 않습니다.");
        }

        // jwt 생성
        User user = userRepository.findById(Long.parseLong(key))
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        PrincipalDetails principalDetails = new PrincipalDetails(user);
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(principalDetails, null, principalDetails.getAuthorities());
        String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        saveRefreshToken(key, newRefreshToken, Duration.ofMillis(refreshTokenExpirationMs));

        return new LoginResponseDto("Bearer", newAccessToken, accessTokenExpirationMs, newRefreshToken, refreshTokenExpirationMs);
    }

}

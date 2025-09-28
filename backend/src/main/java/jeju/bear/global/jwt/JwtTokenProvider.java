package jeju.bear.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jeju.bear.auth.model.PrincipalDetails;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final UserRepository userRepository;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String AUTHORITIES_KEY = "auth";
    private static final String BEARER_TYPE = "Bearer";

    @Value("${spring.jwt.access-token.expiration-time}")
    private long accessTokenExpirationMs;

    @Value("${spring.jwt.refresh-token.expiration-time}")
    private long refreshTokenExpirationMs;

    @Value("${spring.jwt.secret}")
    private String secretKey;

    private SecretKey key;

    // String 타입의 키를 바탕으로 SecretKey (HMAC 서명에 사용) 생성
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Authentication authentication) {
        // authentication.getName() -> PrincipalDetails -> getUsername() -> user_id
        return createToken(authentication.getName(), "access", accessTokenExpirationMs, getAuthorities(authentication));
    }

    public String generateRefreshToken(Authentication authentication) {
        return createToken(authentication.getName(), "refresh", refreshTokenExpirationMs, null);
    }

    private String createToken(String subject, String type, long expirationMillis, String authorities) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis);

        // claim: 본문
        // type: access/refresh 구분 용도
        JwtBuilder builder = Jwts.builder()
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS512) // 64비트 이상의 키 추천
                .claim("type", type);

        if(subject != null) {
            builder.setSubject(subject);
            
            // 사용자 정보 추가 (access token에만)
            if("access".equals(type)) {
                try {
                    User user = userRepository.findById(Long.parseLong(subject)).orElse(null);
                    if(user != null) {
                        builder.claim("email", user.getEmail())
                               .claim("nickname", user.getNickname())
                               .claim("profileImage", user.getProfileImage());
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰에 사용자 정보 추가 실패: {}", e.getMessage());
                }
            }
        }
        if(authorities != null) {
            builder.claim(AUTHORITIES_KEY, authorities); // role
        }

        return builder.compact();
    }

    // 권한들을 하나의 문자열로 합쳐서 리턴
    private String getAuthorities(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
    }

    public Authentication getAuthentication(String accessToken) {
        Claims claims = parseClaims(accessToken);

        if(claims.get(AUTHORITIES_KEY) == null) {
            //throw new RuntimeException("Token does not contain authority information.");
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Token does not contain authority information.");
        }

        // 클레임에서 권한 가져와서 GrantedAuthority 리스트로 반환
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .toList();

        if(claims.getSubject() == null) {
            log.info("subject is null");
        }

        // JWT로 이미 인증을 끝낸 상태이므로 비밀번호는 필요 x
        User user = userRepository.findById(Long.parseLong(claims.getSubject()))
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        PrincipalDetails principal = new PrincipalDetails(user);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    // 유효성 검사
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT token: {}", e.getMessage());
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Expired JWT token");
        } catch (UnsupportedJwtException e) { // 지원하지 않는 형식
            log.info("Unsupported JWT token: {}", e.getMessage());
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Unsupported JWT token");
        } catch (MalformedJwtException e) { // 구조, 형식이 잘못됨
            log.info("Invalid JWT token: {}", e.getMessage());
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Invalid JWT token");
        } catch (SecurityException | IllegalArgumentException e) { // 서명이 올바르지 않거나 claim이 비어있음
            log.info("JWT claims string is empty or signature does not match.");
            throw new CustomException(ErrorCode.UNAUTHORIZED, "JWT claims string is empty or signature does not match.");
        }
        //return false;
    }

    // JWT 파싱해서 클레임 꺼냄
    private Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    // 헤더에서 JWT 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_TYPE)) {
            return bearerToken.substring(BEARER_TYPE.length()).trim();
        }
        return null;
    }

    public String getSubjectFromRefreshToken(String refreshToken) {
        return parseClaims(refreshToken).getSubject();
    }
}

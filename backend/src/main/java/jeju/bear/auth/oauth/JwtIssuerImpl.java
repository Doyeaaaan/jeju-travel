package jeju.bear.auth.oauth;

import jeju.bear.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtIssuerImpl implements JwtIssuer {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String issueFor(String email) {
        // 이메일을 기반으로 간단한 Authentication 객체 생성
        Authentication auth = new UsernamePasswordAuthenticationToken(
            email, 
            null, 
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        return jwtTokenProvider.generateAccessToken(auth);
    }
}

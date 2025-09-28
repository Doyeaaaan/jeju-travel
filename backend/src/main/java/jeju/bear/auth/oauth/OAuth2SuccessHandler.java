package jeju.bear.auth.oauth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtIssuer jwtIssuer;
    @Value("${app.oauth2.frontend-redirect:http://localhost:3000/auth/callback}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth) throws IOException {
        OAuth2User principal = (OAuth2User) auth.getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();

        String email = null;
        
        // 구글: email 바로 있음
        if (attributes.containsKey("email")) {
            email = (String) attributes.get("email");
        }
        // 카카오: kakao_account.email
        else if (attributes.containsKey("kakao_account")) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount != null && kakaoAccount.containsKey("email")) {
                email = (String) kakaoAccount.get("email");
            }
        }

        if (email != null) {
            String jwt = jwtIssuer.issueFor(email);
            String url = frontendRedirect + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
            res.sendRedirect(url);
        } else {
            // 이메일을 가져올 수 없는 경우
            String url = frontendRedirect + "?error=" + URLEncoder.encode("이메일 정보를 가져올 수 없습니다", StandardCharsets.UTF_8);
            res.sendRedirect(url);
        }
    }
}

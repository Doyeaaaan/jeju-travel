package jeju.bear.auth.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth2.frontend-error-redirect:${app.oauth2.frontend-redirect:http://localhost:3000/auth/callback}}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationFailure(HttpServletRequest req, HttpServletResponse res, AuthenticationException ex) throws IOException {
        String url = frontendRedirect + "?error=" + URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8);
        res.sendRedirect(url);
    }
}

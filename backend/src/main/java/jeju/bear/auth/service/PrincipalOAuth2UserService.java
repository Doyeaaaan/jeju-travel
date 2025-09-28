package jeju.bear.auth.service;

import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class PrincipalOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;


    // Spring Security OAuth2 자동 로그인을 위한 메서드
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = null;
        if ("google".equals(provider)) {
            email = (String) attributes.get("email");
        } else if ("kakao".equals(provider)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        }

        // 최초 가입/동기화 (필요 시)
        if (email != null) {
            ensureUser(email, provider, attributes);
        }

        // 권한/키는 프로젝트에 맞게
        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                oAuth2User.getAttributes(),
                "email" // nameAttributeKey (카카오는 필요 시 커스터마이즈)
        );
    }

    private void ensureUser(String email, String provider, Map<String, Object> attributes) {
        // 이메일로 사용자 찾기
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            // 사용자가 없으면 기본 사용자 정보로 생성 (필요 시)
            log.info("OAuth2 사용자 발견: {} ({})", email, provider);
        }
    }

}

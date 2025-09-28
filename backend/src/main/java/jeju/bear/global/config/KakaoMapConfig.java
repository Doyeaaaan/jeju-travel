package jeju.bear.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class KakaoMapConfig {

    @Value("${kakao.rest-api-key}")
    private String kakaoApiKey;

    @Bean
    public RestTemplate kakaoRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set("Authorization", "KakaoAK " + kakaoApiKey);
            return execution.execute(request, body);
        });
        return restTemplate;
    }

    public String getKakaoApiKey() {
        return kakaoApiKey;
    }
} 
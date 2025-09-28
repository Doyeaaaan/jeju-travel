package jeju.bear.config;

import jeju.bear.global.config.KakaoMapConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient kakaoWebClient(KakaoMapConfig kakaoMapConfig) {
        return WebClient.builder()
            .baseUrl("https://dapi.kakao.com")
            .defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoMapConfig.getKakaoApiKey())
            .build();
    }
}

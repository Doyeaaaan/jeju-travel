package jeju.bear.place.client;
import jeju.bear.place.dto.VisitJejuResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;

import java.net.URI;

@Component
@RequiredArgsConstructor
public class VisitJejuApiClient {

    private final WebClient webClient;

    @Value("${visitjeju.api-key}")
    private String apiKey;

    public VisitJejuResponse getAttractions(String category, int page, int size) {
        return webClient.get()
                .uri(uriBuilder -> buildUri(uriBuilder, category, page, size))
                .retrieve()
                .bodyToMono(VisitJejuResponse.class)
                .block();
    }

    private URI buildUri(UriBuilder uriBuilder, String category, int page, int size) {
        return uriBuilder
                .path("/vsjApi/contents/searchList")
                .queryParam("apiKey", apiKey)
                .queryParam("locale", "kr")
                .queryParam("category", category)
                .queryParam("page", page)
                .queryParam("pageSize", size)
                .build();
    }

    @Configuration
    public static class WebClientConfig {
        @Bean
        public WebClient webClient() {
            return WebClient.builder()
                    .baseUrl("https://api.visitjeju.net")
                    .build();
        }
    }

}
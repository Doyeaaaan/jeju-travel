package jeju.bear.place.service;

import com.fasterxml.jackson.databind.JsonNode;
import jeju.bear.global.config.KakaoMapConfig;
import jeju.bear.place.dto.PlaceSearchResponse;
import jeju.bear.place.entity.Place;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KakaoMapService {

    private final WebClient kakaoWebClient;
    private final KakaoMapConfig kakaoMapConfig;
    private static final String LOCAL_SEARCH_ADDRESS_URL = "/v2/local/search/address.json";
    private static final String LOCAL_SEARCH_KEYWORD_URL = "/v2/local/search/keyword.json";
    private static final String LOCAL_SEARCH_CATEGORY_URL = "/v2/local/search/category.json";

    public Mono<List<PlaceSearchResponse>> searchByKeyword(String keyword, double latitude, double longitude, int radius) {
        return kakaoWebClient
            .get()
            .uri(uriBuilder -> uriBuilder
                .path(LOCAL_SEARCH_KEYWORD_URL)
                .queryParam("query", keyword)
                .queryParam("x", longitude)
                .queryParam("y", latitude)
                .queryParam("radius", radius)
                .build())
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(this::parsePlaceSearchResponse);
    }

    public Mono<List<PlaceSearchResponse>> searchByCategory(String categoryCode, double latitude, double longitude, int radius) {
        return kakaoWebClient
            .get()
            .uri(uriBuilder -> uriBuilder
                .path(LOCAL_SEARCH_CATEGORY_URL)
                .queryParam("category_group_code", categoryCode)
                .queryParam("x", longitude)
                .queryParam("y", latitude)
                .queryParam("radius", radius)
                .build())
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(this::parsePlaceSearchResponse);
    }

    private List<PlaceSearchResponse> parsePlaceSearchResponse(JsonNode responseBody) {
        List<PlaceSearchResponse> results = new ArrayList<>();
        JsonNode documents = responseBody.get("documents");
        
        for (JsonNode document : documents) {
            results.add(PlaceSearchResponse.builder()
                    .kakaoPlaceId(document.get("id").asText())
                    .placeName(document.get("place_name").asText())
                    .categoryName(document.get("category_name").asText())
                    .address(document.get("address_name").asText())
                    .roadAddress(document.get("road_address_name").asText())
                    .phone(document.get("phone").asText())
                    .placeUrl(document.get("place_url").asText())
                    .latitude(document.get("y").asDouble())
                    .longitude(document.get("x").asDouble())
                    .build());
        }
        
        return results;
    }

    public Place convertToPlace(PlaceSearchResponse response, String category) {
        return Place.builder()
                .contentsId("K" + response.getKakaoPlaceId())
                .name(response.getPlaceName())
                .address(response.getAddress())
                .roadAddress(response.getRoadAddress())
                .latitude(response.getLatitude())
                .longitude(response.getLongitude())
                .category(category)
                .kakaoPlaceId(response.getKakaoPlaceId())
                .phone(response.getPhone())
                .placeUrl(response.getPlaceUrl())
                .build();
    }
} 
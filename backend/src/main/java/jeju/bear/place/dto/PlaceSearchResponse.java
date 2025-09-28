package jeju.bear.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceSearchResponse {
    private String kakaoPlaceId;
    private String placeName;
    private String categoryName;
    private String address;
    private String roadAddress;
    private String phone;
    private String placeUrl;
    private double latitude;
    private double longitude;
} 
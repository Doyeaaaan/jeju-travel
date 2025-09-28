package jeju.bear.place.dto;

import jeju.bear.place.entity.Favorite;
import jeju.bear.place.entity.PlaceType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FavoriteDto {
    private Long id;
    private Long placeId;
    private PlaceType type;
    private String placeName;
    private String placeImage;

    public static FavoriteDto from(Favorite favorite) {
        return FavoriteDto.builder()
                .id(favorite.getId())
                .placeId(favorite.getPlaceId())
                .type(favorite.getType())
                .placeName("장소 " + favorite.getPlaceId()) // 임시로 장소 ID를 이름으로 사용
                .placeImage(null) // 임시로 null
                .build();
    }
} 
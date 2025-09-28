package jeju.bear.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlaceLocationDto {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String address;
    private String imageUrl;
} 
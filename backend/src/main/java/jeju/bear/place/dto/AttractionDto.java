package jeju.bear.place.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttractionDto {
    private String id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private String imageUrl;
}
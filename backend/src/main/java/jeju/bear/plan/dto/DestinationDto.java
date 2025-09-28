package jeju.bear.plan.dto;

import jeju.bear.plan.entity.Destination;
import lombok.Getter;

@Getter
public class DestinationDto {
    private Long id;
    private int sequence;
    private String transportation;
    private long duration;
    private String placeId;
    private String type;
    private int price;
    private String placeName;
    private String address;
    private String memo;

    public static DestinationDto from(Destination d) {
        DestinationDto dto = new DestinationDto();
        dto.id = d.getId();
        dto.sequence = d.getSequence();
        dto.transportation = d.getTransportation();
        dto.duration = d.getDuration();
        dto.placeId = d.getPlaceId();
        dto.type = d.getType();
        dto.price = d.getPrice();
        dto.placeName = d.getPlaceName();
        dto.address = d.getAddress();
        dto.memo = d.getMemo();
        return dto;
    }
}

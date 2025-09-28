package jeju.bear.place.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private String roomId;
    private String roomName;
    private Long price;
    private List<String> images;
}
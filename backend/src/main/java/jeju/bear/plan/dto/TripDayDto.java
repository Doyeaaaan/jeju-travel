package jeju.bear.plan.dto;

import lombok.*;
import jeju.bear.plan.entity.TripDay;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripDayDto {
    private Long tripDayId;
    private Integer dayNumber;
    private java.time.LocalDate date;

    public static TripDayDto from(TripDay day) {
        return TripDayDto.builder()
                .tripDayId(day.getTripDayId())
                .dayNumber(day.getDayNumber())
                .date(day.getDate())
                .build();
    }
}
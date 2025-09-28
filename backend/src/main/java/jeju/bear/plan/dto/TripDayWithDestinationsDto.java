package jeju.bear.plan.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class TripDayWithDestinationsDto {
    private Long tripDayId;
    private int dayNumber;
    private LocalDate date;
    private List<DestinationDto> destinations;
}

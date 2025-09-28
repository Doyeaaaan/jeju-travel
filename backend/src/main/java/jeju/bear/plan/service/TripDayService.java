package jeju.bear.plan.service;

import jeju.bear.plan.dto.TripDayDto;
import java.time.LocalDate;
import java.util.List;

public interface TripDayService {
    List<TripDayDto> getDays(Long tripPlanId, Long userId);
    TripDayDto addTripDay(Long tripPlanId, LocalDate date, Long userId);
}

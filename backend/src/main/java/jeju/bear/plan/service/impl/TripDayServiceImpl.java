package jeju.bear.plan.service.impl;

import jeju.bear.plan.dto.TripDayDto;
import jeju.bear.plan.entity.TripDay;
import jeju.bear.plan.entity.TripPlan;
import jeju.bear.plan.repository.TripDayRepository;
import jeju.bear.plan.repository.TripPlanRepository;
import jeju.bear.plan.service.TripDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TripDayServiceImpl implements TripDayService {
    private final TripPlanRepository tripPlanRepository;
    private final TripDayRepository tripDayRepository;

    @Override
    public List<TripDayDto> getDays(Long tripPlanId, Long userId) {
        TripPlan plan = tripPlanRepository.findById(tripPlanId)
                //.filter(tp -> tp.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Invalid TripPlan or access denied"));

        return plan.getDays().stream()
                .map(TripDayDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public TripDayDto addTripDay(Long tripPlanId, LocalDate date, Long userId) {
        TripPlan plan = tripPlanRepository.findById(tripPlanId)
                .filter(tp -> tp.getUser().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Invalid TripPlan or access denied"));

        // plan.startDate 로부터 몇 일 차인지 계산 (1일 차부터 시작)
        int dayNumber = (int) ChronoUnit.DAYS.between(plan.getStartDate(), date) + 1;

        TripDay day = TripDay.builder()
                .dayNumber(dayNumber)
                .date(date)
                .tripPlan(plan)
                .build();

        TripDay saved = tripDayRepository.save(day);
        return TripDayDto.from(saved);
    }
}

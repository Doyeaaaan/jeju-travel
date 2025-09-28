package jeju.bear.recommend.service;

import jeju.bear.recommend.core.VectorStore;
import jeju.bear.recommend.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final VectorStore store;

    private List<PlaceSummaryDto> topK(String category, float[] q, int k) {
        var pool = store.pool(category);
        if (pool.isEmpty()) return List.of();
        
        record Sc(int i, float s) {}
        
        if (q == null) {
            return pool.stream()
                    .limit(k)
                    .map(i -> store.getPlaces().get(i))
                    .collect(Collectors.toList());
        }
        
        return pool.stream()
                .map(i -> new Sc(i, store.sim(i, q)))
                .sorted((a, b) -> Float.compare(b.s, a.s))
                .limit(k)
                .map(sc -> store.getPlaces().get(sc.i))
                .collect(Collectors.toList());
    }

    private List<PlaceSummaryDto> unique(List<PlaceSummaryDto> in) {
        var seen = new HashSet<String>();
        var out = new ArrayList<PlaceSummaryDto>();
        for (var p : in) {
            if (p == null) continue;
            var key = (p.getId() != null ? p.getId() : p.getName()) + "|" + p.getCategory();
            if (seen.add(key)) out.add(p);
        }
        return out;
    }

    private List<PlaceSummaryDto> ensureSize(List<PlaceSummaryDto> src, int need) {
        var out = new ArrayList<>(src);
        int i = 0;
        while (out.size() < need && !src.isEmpty()) {
            out.add(src.get(i % src.size()));
            i++;
        }
        return out;
    }

    public RecommendResponse recommend(RecommendRequest req) {
        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        if (days < 1) {
            throw new IllegalArgumentException("종료일은 시작일과 같거나 이후여야 합니다.");
        }

        var kw = Optional.ofNullable(req.getKeywords()).orElseGet(HashMap::new);
        float[] qTour = store.meanVec(kw.getOrDefault("관광지", List.of()));
        float[] qCafe = store.meanVec(kw.getOrDefault("카페", List.of()));
        float[] qFood = store.meanVec(kw.getOrDefault("맛집", List.of()));
        float[] qStay = store.meanVec(kw.getOrDefault("숙소", List.of()));

        // 후보 넉넉히
        var tour = unique(topK("관광지", qTour, 5 * (int) days));
        var cafe = unique(topK("카페", qCafe, 3 * (int) days));  // 없으면 나중에 무시
        var food = unique(topK("맛집", qFood, 5 * (int) days));
        var stay = unique(topK("숙소", qStay, Math.max(3, (int) days)));

        // 숙소 1곳 고정
        var lodging = stay.isEmpty() ? null : stay.get(0);

        // 관광지/카페 합치고 유일화
        var tours = new ArrayList<PlaceSummaryDto>();
        tours.addAll(tour);
        tours.addAll(cafe);              // 카페가 없으면 영향 X
        tours = new ArrayList<>(unique(tours));

        int toursNeeded = (int) days * 2;
        int foodsNeeded = (int) days * 2;
        tours = new ArrayList<>(ensureSize(tours, toursNeeded));
        food = new ArrayList<>(ensureSize(food, foodsNeeded));

        // 옵션 수(오프셋 차이)
        int n = Optional.ofNullable(req.getNumOptions()).orElse(2);
        var options = new ArrayList<ItineraryOptionDto>();

        // 다양한 코스 제목 배열
        String[] courseTitles = {
            "키워드 매칭 코스 A", "키워드 매칭 코스 B", "키워드 매칭 코스 C", "키워드 매칭 코스 D",
            "키워드 매칭 코스 E", "키워드 매칭 코스 F", "키워드 매칭 코스 G", "키워드 매칭 코스 H"
        };
        
        // 랜덤 시드 생성 (시간 기반)
        Random random = new Random(System.currentTimeMillis());
        int titleOffset = random.nextInt(courseTitles.length);

        for (int s = 0; s < n; s++) {
            var daysList = new ArrayList<DayDto>();
            for (int d = 0; d < days; d++) {
                var Tm = tours.get((2 * d + 0 + s) % tours.size());  // morning
                var Ta = tours.get((2 * d + 1 + s) % tours.size());  // afternoon
                var Lh = food.get((2 * d + 0 + s) % food.size());    // lunch
                var Dn = food.get((2 * d + 1 + s) % food.size());    // dinner

                var items = new ArrayList<ItemDto>();
                items.add(ItemDto.builder()
                        .label(Tm.getName())
                        .category(Tm.getCategory())
                        .placeId(Tm.getId())
                        .slot("MORNING")
                        .build());
                items.add(ItemDto.builder()
                        .label(Lh.getName())
                        .category("맛집")
                        .placeId(Lh.getId())
                        .slot("LUNCH")
                        .build());
                items.add(ItemDto.builder()
                        .label(Ta.getName())
                        .category(Ta.getCategory())
                        .placeId(Ta.getId())
                        .slot("AFTERNOON")
                        .build());
                items.add(ItemDto.builder()
                        .label(Dn.getName())
                        .category("맛집")
                        .placeId(Dn.getId())
                        .slot("DINNER")
                        .build());

                // 마지막 날 제외하고 숙소
                if (d < days - 1) {
                    String lodgingLabel = lodging != null ? lodging.getName() : (d == 0 ? "숙소 체크인" : "숙소 휴식");
                    items.add(ItemDto.builder()
                            .label(lodgingLabel)
                            .category("숙소")
                            .placeId(lodging != null ? lodging.getId() : null)
                            .slot("LODGING")
                            .build());
                }
                daysList.add(DayDto.builder()
                        .day(d + 1)
                        .items(items)
                        .build());
            }
            // 동적으로 코스 제목 선택 (랜덤 + 오프셋)
            String courseTitle = courseTitles[(s + titleOffset) % courseTitles.length];
            
            options.add(ItineraryOptionDto.builder()
                    .title(courseTitle)
                    .days(daysList)
                    .build());
        }

        return RecommendResponse.builder()
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .travelers(req.getTravelers())
                .selectedKeywords(kw)
                .options(options)
                .build();
    }
}

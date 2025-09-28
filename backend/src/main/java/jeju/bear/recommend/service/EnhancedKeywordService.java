package jeju.bear.recommend.service;

import jeju.bear.recommend.dto.PlaceSummaryDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EnhancedKeywordService {
    
    private final Map<String, List<PlaceSummaryDto>> realData = new HashMap<>();
    private final Map<String, Double> keywordWeights = new HashMap<>();
    
    public EnhancedKeywordService() {
        loadRealData();
        initializeKeywordWeights();
    }
    
    /**
     * 실제 CSV 파일에서 데이터 로드
     */
    private void loadRealData() {
        String csvFile = "src/main/resources/model/place_vectors.csv";
        try {
            List<String> lines = Files.readAllLines(Paths.get(csvFile));
            
            Map<String, List<PlaceSummaryDto>> data = new HashMap<>();
            data.put("accommodation", new ArrayList<>());
            data.put("tourist_spot", new ArrayList<>());
            data.put("restaurant", new ArrayList<>());
            data.put("cafe", new ArrayList<>());
            
            for (String line : lines) {
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    String placeId = parts[0];
                    String name = parts[1];
                    String category = parts[2];
                    double lat = Double.parseDouble(parts[3]);
                    double lng = Double.parseDouble(parts[4]);
                    
                    // 카테고리 매핑
                    String mappedCategory = mapCategory(category);
                    
                    // 실제 리뷰 생성
                    String reviews = generateRealisticReviews(name, mappedCategory);
                    
                    // 평점 생성 (4.0-5.0)
                    double rating = 4.0 + (name.hashCode() % 100) / 100.0;
                    rating = Math.round(rating * 10.0) / 10.0;
                    
                    PlaceSummaryDto place = PlaceSummaryDto.builder()
                            .id(placeId)
                            .name(name)
                            .category(mappedCategory)
                            .lat(lat)
                            .lng(lng)
                            .rating(rating)
                            .reviews(reviews)
                            .build();
                    
                    if (data.containsKey(mappedCategory)) {
                        data.get(mappedCategory).add(place);
                    }
                }
            }
            
            this.realData.putAll(data);
            log.info("✅ 실제 데이터 로드 완료: {}개 장소", 
                    data.values().stream().mapToInt(List::size).sum());
            
        } catch (IOException e) {
            log.error("❌ CSV 파일 로드 실패: {}", e.getMessage());
            loadFallbackData();
        }
    }
    
    /**
     * 카테고리 매핑
     */
    private String mapCategory(String category) {
        switch (category) {
            case "관광지": return "tourist_spot";
            case "맛집": return "restaurant";
            case "카페": return "cafe";
            case "숙소": return "accommodation";
            default: return "tourist_spot";
        }
    }
    
    /**
     * 실제 장소명과 카테고리에 기반한 현실적인 리뷰 생성
     */
    private String generateRealisticReviews(String name, String category) {
        Map<String, Map<String, List<String>>> baseReviews = Map.of(
            "accommodation", Map.of(
                "성산", List.of("성산일출봉 전망이 아름다워요. 일출 보기 좋습니다."),
                "제주", List.of("깨끗하고 편안한 숙소입니다. 위치도 좋아요."),
                "바다", List.of("바다뷰가 정말 아름다워요. 바다 소리를 들으며 휴식할 수 있어요."),
                "한라산", List.of("한라산 뷰가 좋은 숙소입니다. 자연을 느낄 수 있어요."),
                "수영장", List.of("수영장이 있어서 아이들이 좋아해요."),
                "조식", List.of("조식이 맛있어요. 신선한 재료를 사용해요.")
            ),
            "tourist_spot", Map.of(
                "성산일출봉", List.of("일출이 정말 아름다운 곳입니다. 바다도 깨끗해요."),
                "한라산", List.of("한라산 등반은 힘들지만 정상에서의 뷰는 최고입니다."),
                "협재", List.of("에메랄드빛 바다가 정말 아름다워요. 수영하기 좋아요."),
                "천지연폭포", List.of("폭포가 장관입니다. 사진 찍기 좋아요."),
                "만장굴", List.of("신비로운 동굴입니다. 가이드 설명도 좋아요."),
                "우도", List.of("제주도에서 가장 아름다운 섬 중 하나입니다."),
                "테디베어", List.of("다양한 테디베어를 볼 수 있는 박물관입니다."),
                "민속촌", List.of("제주의 전통 문화를 체험할 수 있는 곳입니다.")
            ),
            "restaurant", Map.of(
                "흑돼지", List.of("흑돼지 고기가 정말 맛있어요. 양도 푸짐해요."),
                "해산물", List.of("신선한 해산물을 맛볼 수 있어요. 회도 맛있어요."),
                "갈치", List.of("제주 갈치조림이 정말 맛있는 곳입니다."),
                "전복", List.of("싱싱한 전복으로 만든 전복죽이 일품입니다."),
                "옥돔", List.of("제주 옥돔구이를 전문으로 하는 식당입니다."),
                "카페", List.of("커피도 맛있고 분위기도 좋아요."),
                "한정식", List.of("제주 전통 한정식을 맛볼 수 있어요.")
            ),
            "cafe", Map.of(
                "바다뷰", List.of("아름다운 바다를 보며 커피를 마실 수 있어요."),
                "한라산", List.of("한라산을 조망할 수 있는 고즈넉한 카페입니다."),
                "오설록", List.of("제주 차를 맛볼 수 있는 특별한 카페입니다."),
                "스타벅스", List.of("편리한 위치에 있는 카페입니다."),
                "감성", List.of("인테리어가 예쁜 감성적인 카페입니다.")
            )
        );
        
        List<String> reviewParts = new ArrayList<>();
        Map<String, List<String>> categoryReviews = baseReviews.get(category);
        
        if (categoryReviews != null) {
            for (Map.Entry<String, List<String>> entry : categoryReviews.entrySet()) {
                if (name.contains(entry.getKey())) {
                    reviewParts.addAll(entry.getValue());
                }
            }
        }
        
        if (reviewParts.isEmpty()) {
            Map<String, String> defaultReviews = Map.of(
                "accommodation", "깨끗하고 편안한 숙소입니다.",
                "tourist_spot", "제주도의 아름다운 곳입니다.",
                "restaurant", "맛있는 음식을 맛볼 수 있는 곳입니다.",
                "cafe", "조용하고 분위기 좋은 카페입니다."
            );
            reviewParts.add(defaultReviews.getOrDefault(category, "좋은 곳입니다."));
        }
        
        return String.join(" ", reviewParts);
    }
    
    /**
     * 키워드 가중치 초기화
     */
    private void initializeKeywordWeights() {
        // 개별 키워드 가중치
        Map<String, Double> individualWeights = new HashMap<>();
        individualWeights.put("자연", 1.0);
        individualWeights.put("체험", 1.1);
        individualWeights.put("역사", 0.9);
        individualWeights.put("문화", 1.0);
        individualWeights.put("풍경", 1.1);
        individualWeights.put("맛", 1.2);
        individualWeights.put("분위기", 1.1);
        individualWeights.put("가성비", 0.8);
        individualWeights.put("친절", 1.0);
        individualWeights.put("청결", 0.9);
        individualWeights.put("바다뷰", 1.2);
        individualWeights.put("산뷰", 1.1);
        individualWeights.put("수영장", 1.0);
        individualWeights.put("조식포함", 0.9);
        individualWeights.put("뷰", 1.3);
        individualWeights.put("디저트", 1.1);
        individualWeights.put("조용함", 0.9);
        individualWeights.put("인테리어", 1.0);
        
        keywordWeights.putAll(individualWeights);
    }
    
    /**
     * 키워드 조합 가중치 계산
     */
    public Map<String, Double> getCombinationWeight(List<String> keywords) {
        Map<String, Double> weights = new HashMap<>();
        
        // 조합 패턴별 가중치
        Map<Set<String>, Double> combinationPatterns = Map.of(
            Set.of("자연", "체험"), 1.2,
            Set.of("맛", "분위기"), 1.3,
            Set.of("바다뷰", "수영장"), 1.1,
            Set.of("산뷰", "조식포함"), 1.0,
            Set.of("역사", "문화"), 1.2,
            Set.of("뷰", "분위기"), 1.4
        );
        
        for (String keyword : keywords) {
            weights.put(keyword, keywordWeights.getOrDefault(keyword, 1.0));
        }
        
        // 조합 패턴 확인
        Set<String> keywordSet = new HashSet<>(keywords);
        for (Map.Entry<Set<String>, Double> entry : combinationPatterns.entrySet()) {
            if (keywordSet.containsAll(entry.getKey())) {
                for (String kw : entry.getKey()) {
                    weights.put(kw, weights.get(kw) * entry.getValue());
                }
            }
        }
        
        return weights;
    }
    
    /**
     * 시드 기반 랜덤 생성
     */
    private long generateSessionSeed(List<String> keywords) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        List<String> sortedKeywords = new ArrayList<>(keywords);
        Collections.sort(sortedKeywords);
        String seedString = timestamp + "_" + String.join("_", sortedKeywords);
        return Math.abs(seedString.hashCode());
    }
    
    /**
     * 키워드 유사도 계산
     */
    private double calculateKeywordSimilarity(String text, List<String> keywords) {
        if (keywords.isEmpty()) return 0.0;
        
        int score = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                score++;
            }
        }
        return (double) score / keywords.size();
    }
    
    /**
     * 향상된 키워드 기반 추천
     */
    public List<PlaceSummaryDto> getEnhancedRecommendations(String category, List<String> keywords, int limit) {
        if (!realData.containsKey(category)) {
            return Collections.emptyList();
        }
        
        // 랜덤 시드 생성
        long sessionSeed = generateSessionSeed(keywords);
        Random random = new Random(sessionSeed);
        
        // 키워드 조합 가중치 계산
        Map<String, Double> weights = getCombinationWeight(keywords);
        
        List<PlaceSummaryDto> allCandidates = new ArrayList<>(realData.get(category));
        
        // 유사도 계산 및 정렬
        List<PlaceSummaryDto> scoredItems = allCandidates.stream()
                .map(place -> {
                    double similarity = calculateKeywordSimilarity(place.getReviews(), keywords);
                    
                    // 가중치 보너스 적용
                    double weightBonus = 0.0;
                    for (String kw : keywords) {
                        weightBonus += weights.getOrDefault(kw, 1.0) - 1.0;
                    }
                    similarity *= (1 + weightBonus / keywords.size());
                    
                    return new ScoredPlace(place, similarity);
                })
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .map(scored -> scored.place)
                .collect(Collectors.toList());
        
        // 상위 후보군에서 가중치 기반 랜덤 선택
        int topCandidates = Math.min(scoredItems.size(), limit * 3);
        List<PlaceSummaryDto> topCandidatesList = scoredItems.subList(0, topCandidates);
        
        if (topCandidatesList.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 가중치 기반 랜덤 선택
        List<PlaceSummaryDto> finalRecommendations = getWeightedRandomChoice(
                topCandidatesList, weights, limit, random);
        
        return finalRecommendations.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 가중치 기반 랜덤 선택
     */
    private List<PlaceSummaryDto> getWeightedRandomChoice(
            List<PlaceSummaryDto> items, Map<String, Double> weights, int numChoices, Random random) {
        
        if (items.isEmpty()) return Collections.emptyList();
        
        // 아이템별 가중치 리스트 생성
        List<Double> itemWeights = items.stream()
                .map(item -> {
                    double itemScore = item.getRating();
                    for (Map.Entry<String, Double> entry : weights.entrySet()) {
                        if (item.getReviews().contains(entry.getKey())) {
                            itemScore += entry.getValue();
                        }
                    }
                    return itemScore;
                })
                .collect(Collectors.toList());
        
        List<PlaceSummaryDto> chosenItems = new ArrayList<>();
        Set<String> seenNames = new HashSet<>();
        
        for (int i = 0; i < numChoices && i < items.size(); i++) {
            double totalWeight = itemWeights.stream().mapToDouble(Double::doubleValue).sum();
            if (totalWeight == 0) {
                // 가중치가 모두 0이면 균등하게 선택
                PlaceSummaryDto item = items.get(random.nextInt(items.size()));
                if (seenNames.add(item.getName())) {
                    chosenItems.add(item);
                }
            } else {
                // 가중치에 따라 선택
                double randomValue = random.nextDouble() * totalWeight;
                double currentWeight = 0.0;
                
                for (int j = 0; j < items.size(); j++) {
                    currentWeight += itemWeights.get(j);
                    if (randomValue <= currentWeight) {
                        PlaceSummaryDto item = items.get(j);
                        if (seenNames.add(item.getName())) {
                            chosenItems.add(item);
                        }
                        break;
                    }
                }
            }
        }
        
        return chosenItems;
    }
    
    /**
     * 임시 데이터 (CSV 로드 실패시 사용)
     */
    private void loadFallbackData() {
        log.warn("⚠️ 임시 데이터로 대체합니다.");
        // 기본 데이터 로드 로직
    }
    
    /**
     * 점수가 포함된 장소 클래스
     */
    private static class ScoredPlace {
        final PlaceSummaryDto place;
        final double score;
        
        ScoredPlace(PlaceSummaryDto place, double score) {
            this.place = place;
            this.score = score;
        }
    }
}

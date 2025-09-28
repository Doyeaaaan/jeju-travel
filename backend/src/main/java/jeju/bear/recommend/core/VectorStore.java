package jeju.bear.recommend.core;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import jeju.bear.recommend.dto.PlaceSummaryDto;

import java.io.*;
import java.nio.file.*;
import java.util.*;

@Slf4j
@Component
public class VectorStore {
    @Getter
    private Map<String, float[]> w2v = new HashMap<>();
    @Getter
    private List<PlaceSummaryDto> places = new ArrayList<>();
    @Getter
    private float[][] matrix; // L2-normalized
    private int dim;
    private final Map<String, List<Integer>> indexByCategory = new HashMap<>();

    @PostConstruct
    public void load() {
        try {
            // JAR 파일 내부에서 모델 파일 찾기
            Path base = null;
            String[] possiblePaths = {
                "src/main/resources/model",
                "target/classes/model",
                "BOOT-INF/classes/model",
                "model"
            };
            
            for (String path : possiblePaths) {
                Path testPath = Paths.get(path);
                if (Files.exists(testPath) && 
                    Files.exists(testPath.resolve("word2vec.txt")) && 
                    Files.exists(testPath.resolve("place_vectors.csv"))) {
                    base = testPath;
                    break;
                }
            }
            
            // 모델 파일이 없으면 더미 데이터로 초기화
            if (base == null) {
                log.warn("모델 파일이 없습니다. 더미 데이터로 초기화합니다.");
                initializeDummyData();
                return;
            }
            
            loadW2V(base.resolve("word2vec.txt"));
            loadPlaces(base.resolve("place_vectors.csv"));
            normalizeRows();
            log.info("Loaded: {} words, {} places (dim={})", w2v.size(), places.size(), dim);
        } catch (Exception e) {
            log.error("벡터 데이터 로딩 실패: {}", e.getMessage(), e);
            log.warn("더미 데이터로 초기화합니다.");
            initializeDummyData();
        }
    }

    private void initializeDummyData() {
        // 더미 word2vec 데이터
        w2v.put("자연", new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f});
        w2v.put("체험", new float[]{0.2f, 0.3f, 0.4f, 0.5f, 0.6f});
        w2v.put("힐링", new float[]{0.3f, 0.4f, 0.5f, 0.6f, 0.7f});
        w2v.put("청결", new float[]{0.4f, 0.5f, 0.6f, 0.7f, 0.8f});
        w2v.put("맛", new float[]{0.5f, 0.6f, 0.7f, 0.8f, 0.9f});
        w2v.put("분위기", new float[]{0.6f, 0.7f, 0.8f, 0.9f, 1.0f});
        w2v.put("뷰", new float[]{0.7f, 0.8f, 0.9f, 1.0f, 0.1f});
        
        dim = 5;
        
        // 더미 장소 데이터
        String[] placeNames = {
            "협재해수욕장", "성산일출봉", "한라산", "중문관광단지", "제주올레길",
            "제주맛집1", "제주맛집2", "제주맛집3", "제주맛집4", "제주맛집5",
            "제주카페1", "제주카페2", "제주카페3", "제주카페4", "제주카페5",
            "제주호텔1", "제주호텔2", "제주호텔3", "제주호텔4", "제주호텔5"
        };
        
        String[] categories = {"관광지", "맛집", "카페", "숙소"};
        
        for (int i = 0; i < placeNames.length; i++) {
            String category = categories[i / 5];
            PlaceSummaryDto place = PlaceSummaryDto.builder()
                    .id("place_" + i)
                    .name(placeNames[i])
                    .category(category)
                    .lat(33.0 + (i % 10) * 0.1)
                    .lng(126.0 + (i % 10) * 0.1)
                    .build();
            places.add(place);
            
            // 카테고리별 인덱스 추가
            indexByCategory.computeIfAbsent(category, k -> new ArrayList<>()).add(i);
        }
        
        // 더미 벡터 매트릭스
        matrix = new float[places.size()][dim];
        for (int i = 0; i < places.size(); i++) {
            for (int j = 0; j < dim; j++) {
                matrix[i][j] = (float) Math.random() * 0.1f + 0.1f;
            }
        }
        
        normalizeRows();
        log.info("더미 데이터 초기화 완료: {} words, {} places (dim={})", w2v.size(), places.size(), dim);
    }

    private void loadW2V(Path path) throws Exception {
        try (BufferedReader br = Files.newBufferedReader(path)) {
            String line = br.readLine();
            if (line != null && !line.matches("^\\d+\\s+\\d+$")) {
                parseWord(line);
            }
            while ((line = br.readLine()) != null) {
                parseWord(line);
            }
        }
    }

    private void parseWord(String line) {
        String[] t = line.trim().split("\\s+");
        if (t.length < 10) return;
        String w = t[0];
        float[] v = new float[t.length - 1];
        for (int i = 1; i < t.length; i++) {
            v[i - 1] = Float.parseFloat(t[i]);
        }
        dim = v.length;
        w2v.put(w, v);
    }

    private void loadPlaces(Path path) throws Exception {
        List<float[]> vecs = new ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(path)) {
            for (String line; (line = br.readLine()) != null; ) {
                String[] t = line.split(",");
                if (t.length < 6) continue;
                var p = PlaceSummaryDto.builder()
                        .id(t[0])
                        .name(t[1])
                        .category(t[2])
                        .lat(t[3].isEmpty() ? null : Double.valueOf(t[3]))
                        .lng(t[4].isEmpty() ? null : Double.valueOf(t[4]))
                        .build();
                places.add(p);
                float[] v = new float[t.length - 5];
                for (int i = 5; i < t.length; i++) {
                    v[i - 5] = Float.parseFloat(t[i]);
                }
                vecs.add(v);
                indexByCategory.computeIfAbsent(p.getCategory(), k -> new ArrayList<>()).add(places.size() - 1);
            }
        }
        matrix = vecs.toArray(new float[0][]);
        if (dim == 0 && matrix.length > 0) {
            dim = matrix[0].length;
        }
    }

    private void normalizeRows() {
        for (int i = 0; i < matrix.length; i++) {
            float s = 0;
            for (float x : matrix[i]) {
                s += x * x;
            }
            s = (float) Math.sqrt(s) + 1e-9f;
            for (int j = 0; j < matrix[i].length; j++) {
                matrix[i][j] /= s;
            }
        }
    }

    public float[] meanVec(List<String> words) {
        if (words == null || words.isEmpty()) return null;
        float[] m = new float[dim];
        int c = 0;
        for (String w : words) {
            float[] v = w2v.get(w);
            if (v == null) continue;
            for (int i = 0; i < dim; i++) {
                m[i] += v[i];
            }
            c++;
        }
        if (c == 0) return null;
        float s = 0;
        for (float x : m) {
            s += x * x;
        }
        s = (float) Math.sqrt(s) + 1e-9f;
        for (int i = 0; i < dim; i++) {
            m[i] /= s;
        }
        return m;
    }

    public List<Integer> pool(String cat) {
        return indexByCategory.getOrDefault(cat, List.of());
    }

    public float sim(int idx, float[] q) {
        float s = 0;
        var r = matrix[idx];
        for (int i = 0; i < r.length; i++) {
            s += r[i] * q[i];
        }
        return s;
    }
}

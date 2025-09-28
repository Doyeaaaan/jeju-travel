package jeju.bear.place.service;

import com.google.gson.*;
import jeju.bear.place.dto.PlaceDto;
import jeju.bear.place.dto.RoomDto;
import okhttp3.*;
import org.brotli.dec.BrotliInputStream;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

@Service
public class YeogiService {
    private static final Logger log = LoggerFactory.getLogger(YeogiService.class);

    private static final OkHttpClient client = new OkHttpClient.Builder()
            .callTimeout(java.time.Duration.ofSeconds(20))
            .connectTimeout(java.time.Duration.ofSeconds(15))
            .readTimeout(java.time.Duration.ofSeconds(15))
            .writeTimeout(java.time.Duration.ofSeconds(15))
            .cookieJar(new CookieJar() {
                private final Map<String, List<Cookie>> cookieStore = new HashMap<>();
                
                @Override
                public void saveFromResponse(HttpUrl url, List<Cookie> cookies) {
                    cookieStore.put(url.host(), cookies);
                }
                
                @Override
                public List<Cookie> loadForRequest(HttpUrl url) {
                    List<Cookie> cookies = cookieStore.get(url.host());
                    return cookies != null ? cookies : new ArrayList<>();
                }
            })
            .build();

    private static final Gson gson = new Gson();
    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int MAX_PLACES = 100;

    @Cacheable(value = "places", key = "#keyword + '_' + #checkIn + '_' + #checkOut + '_' + #personal + '_' + #limit")
    public List<PlaceDto> fetchPlaceIds(String keyword, String checkIn, String checkOut, int personal, int limit) throws Exception {
        List<PlaceDto> result = new ArrayList<>();
        int page = 1;

        log.info("Starting to fetch places for keyword: {}, checkIn: {}, checkOut: {}, personal: {}", keyword, checkIn, checkOut, personal);

        // 1. 메인 페이지 먼저 방문 (쿠키 설정)
        log.info("Visiting main page first...");
        try {
            String mainPage = safeGet("https://www.yeogi.com");
            log.info("Main page visited successfully, length: {}", mainPage.length());
            
            // 약간의 지연
            Thread.sleep(2000);
        } catch (Exception e) {
            log.warn("Failed to visit main page: {}", e.getMessage());
        }

        while (result.size() < limit) {
            String qs = String.format("keyword=%s&checkIn=%s&checkOut=%s&personal=%d&freeForm=false&page=%d",
                    URLEncoder.encode(keyword, StandardCharsets.UTF_8), checkIn, checkOut, personal, page);

            log.info("Fetching page {} with query: {}", page, qs);

            String html = safeGet("https://www.yeogi.com/domestic-accommodations?" + qs);
            
            // HTML 응답 확인
            if (html.length() < 1000 || !html.contains("<!DOCTYPE html>") && !html.contains("<html")) {
                log.error("Received invalid HTML response, length: {}, first 200 chars: {}", 
                         html.length(), html.substring(0, Math.min(html.length(), 200)));
                break;
            }
            
            String buildId = extractBuildId(html);
            if (buildId == null) {
                log.error("Failed to extract buildId for page {}", page);
                break;
            }

            log.info("Found buildId: {} for page {}", buildId, page);

            // 지연 추가
            Thread.sleep(1000);

            String jsonUrl = String.format("https://www.yeogi.com/_next/data/%s/domestic-accommodations.json?%s", buildId, qs);
            String json = safeGet(jsonUrl);

            JsonObject root = gson.fromJson(json, JsonObject.class);
            if (root == null || !root.has("pageProps")) {
                log.error("Invalid JSON structure: missing pageProps for page {}", page);
                break;
            }

            JsonObject props = root.getAsJsonObject("pageProps");
            JsonElement accommodations = props.get("accommodationsData");

            JsonArray list = accommodations.isJsonArray()
                    ? accommodations.getAsJsonArray()
                    : accommodations.getAsJsonObject().getAsJsonArray("contents");

            if (list == null || list.isEmpty()) {
                log.info("No more accommodations found on page {}", page);
                break;
            }

            log.info("Found {} accommodations on page {}", list.size(), page);

            // 순차 처리로 변경 (병렬 처리 제거)
            for (JsonElement el : list) {
                if (result.size() >= limit) break;

                try {
                    JsonObject item = el.getAsJsonObject();
                    if (!item.has("meta")) {
                        log.warn("Accommodation missing meta data");
                        continue;
                    }

                    JsonObject meta = item.getAsJsonObject("meta");
                    if (meta != null && meta.has("id") && meta.has("name")) {
                        Double latitude = null;
                        Double longitude = null;

                        if (meta.has("location")) {
                            JsonObject location = meta.getAsJsonObject("location");
                            if (location.has("latitude")) {
                                latitude = location.get("latitude").getAsDouble();
                            }
                            if (location.has("longitude")) {
                                longitude = location.get("longitude").getAsDouble();
                            }
                        }

                        String imageUrl = null;
                        if (meta.has("images") && meta.get("images").isJsonArray()) {
                            JsonArray images = meta.getAsJsonArray("images");
                            if (images.size() > 0) {
                                imageUrl = images.get(0).getAsString();
                            }
                        }

                        String grade = null;
                        if (meta.has("grade")) {
                            grade = meta.get("grade").getAsString();
                        }

                        String address = null;
                        if (meta.has("address")) {
                            JsonObject addressObj = meta.getAsJsonObject("address");
                            if (addressObj.has("address")) {
                                address = addressObj.get("address").getAsString();
                            }
                        }

                        PlaceDto place = new PlaceDto();
                        place.setId(meta.get("id").getAsLong());
                        place.setName(meta.get("name").getAsString());
                        place.setGrade(grade);
                        place.setLatitude(latitude);
                        place.setLongitude(longitude);
                        place.setImageUrl(imageUrl);
                        place.setAddress(address);

                        result.add(place);
                        log.debug("Successfully processed accommodation: {}", place.getName());
                    }
                } catch (Exception e) {
                    log.error("Error processing accommodation: {}", e.getMessage(), e);
                }
            }

            if (result.size() >= limit) break;
            
            page++;
            
            // 페이지 간 지연
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        log.info("Successfully processed {} accommodations in total", result.size());
        return result;
    }

    @Cacheable(value = "place-details", key = "#placeId + '_' + #checkIn + '_' + #checkOut + '_' + #personal")
    public List<PlaceDto> fetchPlaceById(String placeId, String checkIn, String checkOut, int personal) throws Exception {
        log.info("Fetching place by ID: {}, checkIn: {}, checkOut: {}, personal: {}", placeId, checkIn, checkOut, personal);

        // 1. 메인 페이지 먼저 방문 (쿠키 설정)
        log.info("Visiting main page first...");
        try {
            String mainPage = safeGet("https://www.yeogi.com");
            log.info("Main page visited successfully, length: {}", mainPage.length());
            
            // 약간의 지연
            Thread.sleep(2000);
        } catch (Exception e) {
            log.warn("Failed to visit main page: {}", e.getMessage());
        }

        String qs = String.format("checkIn=%s&checkOut=%s&personal=%d", checkIn, checkOut, personal);
        String html = safeGet(String.format("https://www.yeogi.com/domestic-accommodations/%s?%s", placeId, qs));
        
        // HTML 응답 확인
        if (html.length() < 1000 || !html.contains("<!DOCTYPE html>") && !html.contains("<html")) {
            log.error("Received invalid HTML response, length: {}, first 200 chars: {}", 
                     html.length(), html.substring(0, Math.min(html.length(), 200)));
            return Collections.emptyList();
        }
        
        String buildId = extractBuildId(html);
        if (buildId == null) {
            log.error("Failed to extract buildId for placeId: {}", placeId);
            return Collections.emptyList();
        }

        log.info("Found buildId: {} for place detail", buildId);

        // 지연 추가
        Thread.sleep(1000);

        String jsonUrl = String.format("https://www.yeogi.com/_next/data/%s/domestic-accommodations/%s.json?%s", buildId, placeId, qs);
        String json = safeGet(jsonUrl);

        // JSON 응답 디버깅을 위한 로깅 추가
        log.info("JSON URL: {}", jsonUrl);
        log.info("JSON response length: {}", json.length());
        log.info("JSON response first 500 chars: {}", json.substring(0, Math.min(json.length(), 500)));

        try {
            // JSON이 valid한지 먼저 체크
            if (json == null || json.trim().isEmpty()) {
                log.error("❌ JSON is null or empty");
                return Collections.emptyList();
            }
            
            // JSON 시작 부분 확인
            if (!json.trim().startsWith("{")) {
                log.error("❌ JSON does not start with {, starts with: {}", json.substring(0, Math.min(50, json.length())));
                return Collections.emptyList();
            }
            
            JsonObject root;
            try {
                root = gson.fromJson(json, JsonObject.class);
            } catch (Exception parseException) {
                log.error("❌ Gson parsing failed: {}", parseException.getMessage());
                // 다른 방식으로 파싱 시도
                try {
                    JsonParser parser = new JsonParser();
                    JsonElement element = parser.parse(json);
                    root = element.getAsJsonObject();
                    log.info("✅ JsonParser로 파싱 성공");
                } catch (Exception retryException) {
                    log.error("❌ JsonParser also failed: {}", retryException.getMessage());
                    return Collections.emptyList();
                }
            }
            
            log.info("✅ JSON 파싱 성공");
            
            if (root == null || !root.has("pageProps")) {
                log.error("❌ Invalid JSON structure: missing pageProps for place detail");
                log.error("Root object keys: {}", root != null ? root.keySet() : "null");
                return Collections.emptyList();
            }
            log.info("✅ pageProps 존재");

            JsonObject props = root.getAsJsonObject("pageProps");
            log.info("pageProps keys: {}", props.keySet());
            
            if (!props.has("accommodationInfo")) {
                log.error("❌ No accommodationInfo in pageProps");
                return Collections.emptyList();
            }
            
            JsonObject accInfo = props.getAsJsonObject("accommodationInfo");
            log.info("✅ accommodationInfo 존재");
            log.info("accommodationInfo keys: {}", accInfo.keySet());

            if (accInfo == null || !accInfo.has("meta")) {
                log.error("❌ No meta in accommodationInfo");
                return Collections.emptyList();
            }
            log.info("✅ meta 존재");

            JsonObject meta = accInfo.getAsJsonObject("meta");
            log.info("meta keys: {}", meta.keySet());
            
            if (meta == null || !meta.has("id") || !meta.has("name")) {
                log.error("❌ Invalid accommodation meta data - missing id or name");
                log.error("meta has id: {}, has name: {}", meta.has("id"), meta.has("name"));
                return Collections.emptyList();
            }
            log.info("✅ meta has id and name");
            Double latitude = null;
            Double longitude = null;
            if (meta.has("location")) {
                JsonObject location = meta.getAsJsonObject("location");
                if (location.has("latitude")) {
                    latitude = location.get("latitude").getAsDouble();
                }
                if (location.has("longitude")) {
                    longitude = location.get("longitude").getAsDouble();
                }
            }

            String imageUrl = null;
            if (meta.has("images") && meta.get("images").isJsonArray()) {
                JsonArray images = meta.getAsJsonArray("images");
                if (images.size() > 0) {
                    JsonElement firstImage = images.get(0);
                    if (firstImage.isJsonObject()) {
                        JsonObject imageObj = firstImage.getAsJsonObject();
                        if (imageObj.has("image")) {
                            imageUrl = imageObj.get("image").getAsString();
                        }
                    } else if (firstImage.isJsonPrimitive()) {
                        imageUrl = firstImage.getAsString();
                    }
                }
            }

            String grade = null;
            if (meta.has("grade")) {
                grade = meta.get("grade").getAsString();
            }

            String address = null;
            if (meta.has("address")) {
                JsonElement addressElement = meta.get("address");
                if (addressElement.isJsonObject()) {
                    JsonObject addressObj = addressElement.getAsJsonObject();
                    if (addressObj.has("address")) {
                        address = addressObj.get("address").getAsString();
                    }
                } else if (addressElement.isJsonPrimitive()) {
                    address = addressElement.getAsString();
                }
            }

            PlaceDto place = new PlaceDto();
            place.setId(meta.get("id").getAsLong());
            place.setName(meta.get("name").getAsString());
            place.setGrade(grade);
            place.setLatitude(latitude);
            place.setLongitude(longitude);
            place.setImageUrl(imageUrl);
            place.setAddress(address);

            log.info("Successfully fetched place detail: {}", place.getName());
            return Collections.singletonList(place);
        } catch (Exception e) {
            log.error("JSON parsing error: {}", e.getClass().getSimpleName() + ": " + e.getMessage());
            log.error("Stack trace: ", e);
            log.error("Failed JSON content: {}", json.substring(0, Math.min(json.length(), 1000)));
            return Collections.emptyList();
        }
    }

    @Cacheable(value = "rooms", key = "#placeId + '_' + #checkIn + '_' + #checkOut + '_' + #personal")
    public List<RoomDto> fetchRoomsWithPrices(String placeId, String checkIn, String checkOut, int personal) throws Exception {
        List<RoomDto> rooms = new ArrayList<>();
        String qs = String.format("checkIn=%s&checkOut=%s&personal=%d&freeForm=false", checkIn, checkOut, personal);

        log.info("Fetching rooms for placeId: {}, checkIn: {}, checkOut: {}, personal: {}", placeId, checkIn, checkOut, personal);

        String html = safeGet(String.format("https://www.yeogi.com/domestic-accommodations/%s?%s", placeId, qs));
        String buildId = extractBuildId(html);
        if (buildId == null) throw new RuntimeException("buildId를 찾을 수 없습니다.");

        log.info("Found buildId: {} for room fetching", buildId);

        String jsonUrl = String.format("https://www.yeogi.com/_next/data/%s/domestic-accommodations/%s.json?%s", buildId, placeId, qs);
        String json = safeGet(jsonUrl);

        JsonObject root = gson.fromJson(json, JsonObject.class);
        if (root == null || !root.has("pageProps")) {
            log.error("Invalid JSON structure: missing pageProps for rooms");
            return rooms;
        }

        JsonObject props = root.getAsJsonObject("pageProps");
        JsonObject accInfo = props.getAsJsonObject("accommodationInfo");

        if (accInfo == null || !accInfo.has("rooms")) {
            log.error("No rooms data found");
            return rooms;
        }

        JsonArray roomArr = accInfo.getAsJsonArray("rooms");

        for (JsonElement el : roomArr) {
            try {
                JsonObject room = el.getAsJsonObject();
                String roomId = room.has("roomId") ? room.get("roomId").getAsString() : room.get("id").getAsString();
                String roomName = room.has("roomName") ? room.get("roomName").getAsString() : room.get("name").getAsString();

                Long finalPrice = 0L;
                List<String> imageUrls = new ArrayList<>();

                if (room.has("stay")) {
                    JsonObject stay = room.getAsJsonObject("stay");
                    if (stay.has("price")) {
                        JsonObject priceObj = stay.getAsJsonObject("price");

                        if (priceObj.has("discountTotalPrice") && !priceObj.get("discountTotalPrice").isJsonNull()) {
                            finalPrice = priceObj.get("discountTotalPrice").getAsLong();
                        } else if (priceObj.has("totalPrice") && !priceObj.get("totalPrice").isJsonNull()) {
                            finalPrice = priceObj.get("totalPrice").getAsLong();
                        } else if (priceObj.has("discountPrice") && !priceObj.get("discountPrice").isJsonNull()) {
                            finalPrice = priceObj.get("discountPrice").getAsLong();
                        } else if (priceObj.has("salePrice") && !priceObj.get("salePrice").isJsonNull()) {
                            finalPrice = priceObj.get("salePrice").getAsLong();
                        }
                    }
                }

                // 이미지 처리
                if (room.has("images") && room.get("images").isJsonArray()) {
                    JsonArray images = room.getAsJsonArray("images");
                    for (JsonElement imgEl : images) {
                        if (imgEl.isJsonObject()) {
                            JsonObject imgObj = imgEl.getAsJsonObject();
                            if (imgObj.has("image")) {
                                imageUrls.add(imgObj.get("image").getAsString());
                            }
                        } else {
                            imageUrls.add(imgEl.getAsString());
                        }
                    }
                }

                RoomDto roomDto = new RoomDto();
                roomDto.setRoomId(roomId);
                roomDto.setRoomName(roomName);
                roomDto.setPrice(finalPrice);
                roomDto.setImages(imageUrls);
                rooms.add(roomDto);

                log.debug("Successfully processed room: {} with price: {}", roomName, finalPrice);
            } catch (Exception e) {
                log.error("Error processing room: {}", e.getMessage(), e);
            }
        }

        log.info("Successfully processed {} rooms for place {}", rooms.size(), placeId);
        return rooms;
    }

    private String safeGet(String url) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .header("User-Agent", USER_AGENT)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .header("Accept-Encoding", "gzip, deflate, br")
                .header("Connection", "keep-alive")
                .header("DNT", "1")
                .header("Upgrade-Insecure-Requests", "1")
                .header("Sec-Fetch-Dest", "document")
                .header("Sec-Fetch-Mode", "navigate")
                .header("Sec-Fetch-Site", "none")
                .header("Sec-Fetch-User", "?1")
                .header("sec-ch-ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"")
                .header("sec-ch-ua-mobile", "?0")
                .header("sec-ch-ua-platform", "\"macOS\"")
                .header("Cache-Control", "max-age=0")
                .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.error("HTTP request failed: {} for URL: {}", response.code(), url);
                throw new IOException("HTTP " + response.code());
            }
            
            ResponseBody body = response.body();
            if (body == null) {
                throw new IOException("Empty response body");
            }
            
            String contentEncoding = response.header("Content-Encoding");
            byte[] responseBytes = body.bytes();
            
            log.debug("Response encoding: {}, bytes length: {}", contentEncoding, responseBytes.length);
            
            String content;
            if ("gzip".equalsIgnoreCase(contentEncoding)) {
                // Manual GZIP decompression
                try (GZIPInputStream gzipStream = new GZIPInputStream(new ByteArrayInputStream(responseBytes))) {
                    content = new String(gzipStream.readAllBytes(), StandardCharsets.UTF_8);
                    log.debug("GZIP decompressed content length: {}", content.length());
                }
            } else if ("br".equalsIgnoreCase(contentEncoding)) {
                // Brotli decompression
                try (BrotliInputStream brotliStream = new BrotliInputStream(new ByteArrayInputStream(responseBytes))) {
                    content = new String(brotliStream.readAllBytes(), StandardCharsets.UTF_8);
                    log.debug("Brotli decompressed content length: {}", content.length());
                }
            } else {
                // No compression or unknown
                content = new String(responseBytes, StandardCharsets.UTF_8);
            }
            
            log.debug("Final content length: {}, starts with: {}", 
                     content.length(), content.substring(0, Math.min(content.length(), 100)));
            
            return content;
        }
    }

    private String extractBuildId(String html) {
        // Python에서 성공한 패턴을 첫 번째로 시도
        Pattern pattern1 = Pattern.compile("\\\\\"buildId\\\\\":\\\\\"([^\\\\\"]+)\\\\\"");
        Matcher matcher1 = pattern1.matcher(html);
        if (matcher1.find()) {
            return matcher1.group(1);
        }
        
        // 기존 패턴도 시도
        Pattern pattern2 = Pattern.compile("\\\"buildId\\\":\\\"([^\\\"]+)\\\"");
        Matcher matcher2 = pattern2.matcher(html);
        if (matcher2.find()) {
            return matcher2.group(1);
        }
        
        log.error("buildId pattern not found in HTML. First 1000 chars: {}", 
                 html.substring(0, Math.min(html.length(), 1000)));
        return null;
    }
}
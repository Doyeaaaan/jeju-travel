package jeju.bear.place.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    private String contentsId;  // 내부 컨텐츠 ID

    @Column(nullable = false)
    private String name;        // 장소명

    @Column(nullable = false)
    private String address;     // 주소

    @Column(nullable = false)
    private double latitude;    // 위도

    @Column(nullable = false)
    private double longitude;   // 경도

    @Column(length = 1000)
    private String tag;         // 태그

    @Column(length = 2000)
    private String introduction; // 소개

    private String imageUrl;    // 이미지 URL

    @Column(nullable = false)
    private String category;    // 카테고리 (RESTAURANT, ACCOMMODATION, TOURIST_SPOT)

    // 카카오맵 연동을 위한 추가 필드
    private String kakaoPlaceId;    // 카카오 장소 ID
    private String roadAddress;      // 도로명 주소
    private String phone;            // 전화번호
    private String placeUrl;         // 카카오맵 URL
    
    @Column(length = 5000)
    private String detailInfo;       // 상세 정보 (영업시간, 주차, 메뉴 등)

    // 평점 관련
    private Double rating;           // 평균 평점
    private Integer reviewCount;     // 리뷰 수

    @PrePersist
    @PreUpdate
    private void setDefaultValues() {
        if (reviewCount == null) reviewCount = 0;
        if (rating == null) rating = 0.0;
    }

    // VisitJejuService에서 사용하는 생성자
    public Place(String contentsId, String name, String address, double latitude, double longitude, 
                 String tag, String introduction, String imageUrl, String category) {
        this.contentsId = contentsId;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.tag = tag;
        this.introduction = introduction;
        this.imageUrl = imageUrl;
        this.category = category;
    }
}

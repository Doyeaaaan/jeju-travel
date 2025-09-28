package jeju.bear.place.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "accommodation_details")
public class AccommodationDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "room_name")
    private String roomName;

    @Column(name ="room_price")
    private Integer roomPrice;

    @Column(name ="usage_time")
    private String usageTime;

    @Column(name ="max_capacity")
    private Long maxCapacity;

    @Column(name = "facilities", columnDefinition = "TEXT")
    private String facilities;

    @Column(name ="room_image")
    private String roomImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accommodation_id", nullable = false)
    private Accommodation accommodation;

}

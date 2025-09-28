package jeju.bear.plan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destinations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer sequence;

    @Column(length = 50)
    private String transportation;

    @Column
    private Integer duration;  // 분 단위

    @Column(nullable = false)
    private String placeId;

    @Column(nullable = false)
    private String type;

    @Column
    private Integer price;

    @Column(length = 200)
    private String placeName;

    @Column(length = 500)
    private String address;

    @Column(length = 1000)
    private String memo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_day_id", nullable = false)
    private TripDay tripDay;

    public void updateSequence(Integer newSequence) {
        this.sequence = newSequence;
    }

    public void updateDetails(String transportation, Integer duration, Integer price) {
        this.transportation = transportation;
        this.duration = duration;
        this.price = price;
    }

    public void setTripDay(TripDay tripDay) {
        if (this.tripDay != null) {
            this.tripDay.getDestinations().remove(this);
        }
        this.tripDay = tripDay;
        if (tripDay != null) {
            tripDay.getDestinations().add(this);
        }
    }
}
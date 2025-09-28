package jeju.bear.plan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "costs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long costId;

    @Column(nullable = false)
    private String category;

    @Column
    private Integer otherCost;

    @Column(nullable = false)
    private Integer totalCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_plan_id", nullable = false)
    private TripPlan tripPlan;
}
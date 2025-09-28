package jeju.bear.plan.entity;

import jakarta.persistence.*;
import jeju.bear.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_plan_shares")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripPlanShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_plan_id")
    private TripPlan tripPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id")
    private User sharedWithUser;

    @Column(nullable = false)
    private LocalDateTime sharedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharePermission permission;

    @PrePersist
    protected void onCreate() {
        sharedAt = LocalDateTime.now();
    }
} 
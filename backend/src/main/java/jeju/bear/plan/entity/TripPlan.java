package jeju.bear.plan.entity;

import jakarta.persistence.*;
import jeju.bear.board.entity.Post;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jeju.bear.user.entity.User;

@Entity
@Table(name = "trip_plans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripPlanId;

    @Column(nullable = false)
    private String planName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "tripPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TripDay> days = new ArrayList<>();

    @OneToMany(mappedBy = "tripPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Cost> costs = new ArrayList<>();

    @OneToMany(mappedBy = "tripPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TripPlanShare> shares = new ArrayList<>();

    @OneToMany(mappedBy = "tripPlan")
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    public void updateVisibility(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void addShare(TripPlanShare share) {
        this.shares.add(share);
        share.setTripPlan(this);
    }

    public void removeShare(TripPlanShare share) {
        this.shares.remove(share);
        share.setTripPlan(null);
    }
}
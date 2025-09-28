package jeju.bear.plan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "trip_days")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripDayId;

    @Column(nullable = false)
    private Integer dayNumber;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_plan_id", nullable = false)
    private TripPlan tripPlan;

    @OneToMany(mappedBy = "tripDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Destination> destinations = new ArrayList<>();

    public void addDestination(Destination destination) {
        destination.setSequence(this.destinations.size() + 1);
        destination.setTripDay(this);
        this.destinations.add(destination);
    }

    public void removeDestination(Destination destination) {
        if (destinations.remove(destination)) {
            destination.setTripDay(null);
            reorderDestinations();
        }
    }

    public void reorderDestinations() {
        List<Destination> ordered = destinations.stream()
                .sorted(Comparator.comparing(Destination::getSequence))
                .collect(Collectors.toList());
        
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setSequence(i + 1);
        }
    }

    public void moveDestination(int fromIndex, int toIndex) {
        if (fromIndex < 1 || fromIndex > destinations.size() || 
            toIndex < 1 || toIndex > destinations.size()) {
            throw new IllegalArgumentException("Invalid sequence number");
        }

        Destination destination = destinations.stream()
                .filter(d -> d.getSequence().equals(fromIndex))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Destination not found"));

        if (fromIndex < toIndex) {
            destinations.stream()
                    .filter(d -> d.getSequence() > fromIndex && d.getSequence() <= toIndex)
                    .forEach(d -> d.setSequence(d.getSequence() - 1));
        } else {
            destinations.stream()
                    .filter(d -> d.getSequence() >= toIndex && d.getSequence() < fromIndex)
                    .forEach(d -> d.setSequence(d.getSequence() + 1));
        }

        destination.setSequence(toIndex);
    }

    public void updateDate(LocalDate newDate) {
        this.date = newDate;
    }
}
package jeju.bear.plan.repository;

import jeju.bear.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanUserRepository extends JpaRepository<User, Long> {
}

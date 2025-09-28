package jeju.bear.auth.repository;

import jeju.bear.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByEmailAndCode(String email, String code);
    
    @Modifying
    @Query("DELETE FROM EmailVerification ev WHERE ev.email = :email")
    void deleteAllByEmail(@Param("email") String email);
} 
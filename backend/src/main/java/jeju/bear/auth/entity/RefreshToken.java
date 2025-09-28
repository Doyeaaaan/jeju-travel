package jeju.bear.auth.entity;

import jakarta.persistence.*;
import jeju.bear.global.common.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "refresh_token")
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "refresh_token", nullable = false, unique = true)
    private String refreshToken;

    @Column(name = "expires_at", nullable = false)
    private Long expiresAt;

    @Builder
    public RefreshToken(Long userId, String refreshToken, Long expiresAt) {
        this.userId = userId;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }

    public void updateRefreshToken(String refreshToken, Long expiresAt) {
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
} 
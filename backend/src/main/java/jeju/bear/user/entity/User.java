package jeju.bear.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jeju.bear.board.entity.Comment;
import jeju.bear.board.entity.Post;
import jeju.bear.board.entity.PostLike;
import jeju.bear.global.common.BaseEntity;
import jeju.bear.auth.oauth.provider.OAuth2Provider;
import jeju.bear.place.entity.Favorite;
import jeju.bear.plan.entity.TripPlan;
import jeju.bear.auth.dto.JoinRequestDto;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "nickname", nullable = false)
    private String nickname;

    @Column(name = "profile_image")
    private String profileImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    // oauth2
    @Column(name = "username")
    private String username;

    // oauth2
    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private OAuth2Provider provider;

    // oauth2
    @Column(name = "provider_id")
    private String providerId;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripPlan> tripPlans = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> postLikes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friendsRequested = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friendsReceived = new ArrayList<>();

    public User(JoinRequestDto dto, String password) {
        this.email = dto.getEmail();
        this.password = password;
        this.nickname = dto.getNickname();
        this.role = Role.ROLE_USER;
        this.username = null;
        this.provider = null;
        this.providerId = null;
    }

    @Builder
    public User(String username, String password, String nickname, String email, String profileImage, Role role, OAuth2Provider provider, String providerId) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
        this.profileImage = profileImage;
        this.role = role;
        this.provider = provider;
        this.providerId = providerId;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    public void updateProfileImage(String imageUrl) {
        this.profileImage = imageUrl;
    }
}

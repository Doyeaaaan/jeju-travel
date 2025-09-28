package jeju.bear.place.repository;

import jeju.bear.place.entity.Favorite;
import jeju.bear.place.entity.PlaceType;
import jeju.bear.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // 사용자와 장소로 좋아요 찾기
    Optional<Favorite> findByUserAndPlaceIdAndType(User user, Long placeId, PlaceType type);

    // 사용자의 모든 좋아요 조회
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    // 특정 장소의 좋아요 개수 조회
    long countByPlaceIdAndType(Long placeId, PlaceType type);

    // 사용자가 특정 장소를 좋아요했는지 확인
    boolean existsByUserAndPlaceIdAndType(User user, Long placeId, PlaceType type);

    // 사용자의 특정 타입 좋아요 조회
    @Query("SELECT f FROM Favorite f WHERE f.user = :user AND f.type = :type ORDER BY f.createdAt DESC")
    List<Favorite> findByUserAndType(@Param("user") User user, @Param("type") PlaceType type);

    // 장소 ID와 타입으로 좋아요 삭제
    void deleteByUserAndPlaceIdAndType(User user, Long placeId, PlaceType type);
}

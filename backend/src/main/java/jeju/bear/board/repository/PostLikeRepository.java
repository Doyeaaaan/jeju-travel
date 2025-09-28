package jeju.bear.board.repository;

import jeju.bear.board.entity.Post;
import jeju.bear.board.entity.PostLike;
import jeju.bear.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // 특정 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
    Optional<PostLike> findByPostAndUser(Post post, User user);
    
    // 특정 게시글의 좋아요 개수 조회
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.post = :post")
    long countByPost(@Param("post") Post post);
    
    // 특정 사용자가 특정 게시글에 좋아요를 눌렀는지 확인 (boolean 반환)
    boolean existsByPostAndUser(Post post, User user);
}

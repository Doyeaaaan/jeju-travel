package jeju.bear.place.repository;

import jeju.bear.place.entity.Place;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, String> {
    List<Place> findByCategory(String category);
    List<Place> findByCategory(String category, Pageable pageable);
    Optional<Place> findByContentsId(String contentsId);
    
    @Query(value = "SELECT p FROM Place p WHERE p.category = :category ORDER BY p.rating DESC")
    List<Place> findTopPlacesByCategory(@Param("category") String category, Pageable pageable);
    
    @Query(value = "SELECT p FROM Place p WHERE p.category = :category ORDER BY RAND()")
    List<Place> findRandomPlacesByCategory(@Param("category") String category, Pageable pageable);
}
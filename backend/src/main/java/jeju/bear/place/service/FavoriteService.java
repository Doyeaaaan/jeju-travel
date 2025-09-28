package jeju.bear.place.service;

import jeju.bear.place.dto.FavoriteDto;
import jeju.bear.place.entity.PlaceType;
import jeju.bear.user.entity.User;

import java.util.List;

public interface FavoriteService {
    
    // 좋아요 추가
    FavoriteDto addFavorite(User user, Long placeId, PlaceType type);
    
    // 좋아요 제거
    void removeFavorite(User user, Long placeId, PlaceType type);
    
    // 사용자의 모든 좋아요 조회
    List<FavoriteDto> getUserFavorites(User user);
    
    // 사용자의 특정 타입 좋아요 조회
    List<FavoriteDto> getUserFavoritesByType(User user, PlaceType type);
    
    // 특정 장소의 좋아요 개수 조회
    long getFavoriteCount(Long placeId, PlaceType type);
    
    // 사용자가 특정 장소를 좋아요했는지 확인
    boolean isFavorite(User user, Long placeId, PlaceType type);
    
    // 좋아요 토글 (추가/제거)
    boolean toggleFavorite(User user, Long placeId, PlaceType type);
}

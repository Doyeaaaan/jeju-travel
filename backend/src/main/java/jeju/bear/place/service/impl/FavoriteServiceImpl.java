package jeju.bear.place.service.impl;

import jeju.bear.place.dto.FavoriteDto;
import jeju.bear.place.entity.Favorite;
import jeju.bear.place.entity.PlaceType;
import jeju.bear.place.repository.FavoriteRepository;
import jeju.bear.place.service.FavoriteService;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional
    public FavoriteDto addFavorite(User user, Long placeId, PlaceType type) {
        log.info("좋아요 추가 요청: userId={}, placeId={}, type={}", user.getId(), placeId, type);
        
        // 이미 좋아요한 경우 확인
        if (favoriteRepository.existsByUserAndPlaceIdAndType(user, placeId, type)) {
            log.warn("이미 좋아요한 장소입니다: userId={}, placeId={}, type={}", user.getId(), placeId, type);
            throw new IllegalArgumentException("이미 좋아요한 장소입니다.");
        }

        // 좋아요 생성
        Favorite favorite = Favorite.builder()
                .user(user)
                .placeId(placeId)
                .type(type)
                .build();

        Favorite savedFavorite = favoriteRepository.save(favorite);
        log.info("좋아요 추가 완료: favoriteId={}", savedFavorite.getId());

        return FavoriteDto.from(savedFavorite);
    }

    @Override
    @Transactional
    public void removeFavorite(User user, Long placeId, PlaceType type) {
        log.info("좋아요 제거 요청: userId={}, placeId={}, type={}", user.getId(), placeId, type);
        
        // 좋아요 존재 확인
        if (!favoriteRepository.existsByUserAndPlaceIdAndType(user, placeId, type)) {
            log.warn("좋아요하지 않은 장소입니다: userId={}, placeId={}, type={}", user.getId(), placeId, type);
            throw new IllegalArgumentException("좋아요하지 않은 장소입니다.");
        }

        favoriteRepository.deleteByUserAndPlaceIdAndType(user, placeId, type);
        log.info("좋아요 제거 완료: userId={}, placeId={}, type={}", user.getId(), placeId, type);
    }

    @Override
    public List<FavoriteDto> getUserFavorites(User user) {
        log.info("사용자 좋아요 목록 조회: userId={}", user.getId());
        
        List<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user);
        log.info("조회된 좋아요 개수: {}", favorites.size());

        return favorites.stream()
                .map(FavoriteDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<FavoriteDto> getUserFavoritesByType(User user, PlaceType type) {
        log.info("사용자 특정 타입 좋아요 목록 조회: userId={}, type={}", user.getId(), type);
        
        List<Favorite> favorites = favoriteRepository.findByUserAndType(user, type);
        log.info("조회된 {} 타입 좋아요 개수: {}", type, favorites.size());

        return favorites.stream()
                .map(FavoriteDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public long getFavoriteCount(Long placeId, PlaceType type) {
        log.info("장소 좋아요 개수 조회: placeId={}, type={}", placeId, type);
        
        long count = favoriteRepository.countByPlaceIdAndType(placeId, type);
        log.info("장소 좋아요 개수: {}", count);

        return count;
    }

    @Override
    public boolean isFavorite(User user, Long placeId, PlaceType type) {
        log.info("좋아요 상태 확인: userId={}, placeId={}, type={}", user.getId(), placeId, type);
        
        boolean isFavorited = favoriteRepository.existsByUserAndPlaceIdAndType(user, placeId, type);
        log.info("좋아요 상태: {}", isFavorited);

        return isFavorited;
    }

    @Override
    @Transactional
    public boolean toggleFavorite(User user, Long placeId, PlaceType type) {
        log.info("좋아요 토글 요청: userId={}, placeId={}, type={}", user.getId(), placeId, type);
        
        boolean isFavorited = favoriteRepository.existsByUserAndPlaceIdAndType(user, placeId, type);
        
        if (isFavorited) {
            removeFavorite(user, placeId, type);
            log.info("좋아요 제거됨: userId={}, placeId={}, type={}", user.getId(), placeId, type);
            return false;
        } else {
            addFavorite(user, placeId, type);
            log.info("좋아요 추가됨: userId={}, placeId={}, type={}", user.getId(), placeId, type);
            return true;
        }
    }
}

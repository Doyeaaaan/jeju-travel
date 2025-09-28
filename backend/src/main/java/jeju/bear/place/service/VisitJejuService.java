package jeju.bear.place.service;

import jeju.bear.place.entity.Place;
import jeju.bear.place.repository.PlaceRepository;
import jeju.bear.place.client.VisitJejuApiClient;
import jeju.bear.place.dto.VisitJejuResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VisitJejuService {

    private final VisitJejuApiClient apiClient;
    private final PlaceRepository placeRepository;

    public List<Place> importAttractions(String category, int page, int size) {
        VisitJejuResponse response = apiClient.getAttractions(category, page, size);
        List<Place> saved = response.getItems().stream()
                .map(item -> convert(item, category))
                .filter(Objects::nonNull)
                .map(placeRepository::save)
                .toList();
        return saved;
    }

    private Place convert(VisitJejuResponse.Item item, String category) {
        try {
            if (item.getLatitude() == null || item.getLongitude() == null) return null;

            double lat = new BigDecimal(item.getLatitude()).doubleValue();
            double lng = new BigDecimal(item.getLongitude()).doubleValue();
            String imageUrl = item.getRepPhoto() != null && item.getRepPhoto().getPhotoid() != null
                    ? item.getRepPhoto().getPhotoid().getImgpath()
                    : null;

            return new Place(
                    item.getContentsid(),
                    item.getTitle(),
                    item.getAddr1() != null ? item.getAddr1() : item.getAddress(),
                    lat,
                    lng,
                    item.getAlltag(),
                    item.getIntroduction(),
                    imageUrl,
                    category
            );
        } catch (Exception e) {
            return null;
        }
    }

    public List<Place> getPlacesByCategory(String category, int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return placeRepository.findByCategory(category, pageable);
    }
    
    public List<Place> getRandomPlacesByCategory(String category, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return placeRepository.findRandomPlacesByCategory(category, pageable);
    }

    public Place getPlaceByContentsId(String contentsId) {
        return placeRepository.findByContentsId(contentsId).orElse(null);
    }

}
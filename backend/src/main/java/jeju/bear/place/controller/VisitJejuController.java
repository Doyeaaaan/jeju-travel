package jeju.bear.place.controller;

import io.swagger.v3.oas.annotations.Operation;
import jeju.bear.place.dto.AttractionDto;
import jeju.bear.place.entity.Place;
import jeju.bear.place.service.VisitJejuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/visitjeju")
public class VisitJejuController {

    private final VisitJejuService visitJejuService;

    @Operation(summary = "관광지+맛집 저장", description = "VisitJeju에서 c1(관광지), c4(맛집) 전부 저장")
    @GetMapping("/import")
    public String importAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        visitJejuService.importAttractions("c1", page, size);
        visitJejuService.importAttractions("c4", page, size);
        return "Imported c1(관광지) and c4(맛집)";
    }

    @GetMapping("/attractions")
    public List<AttractionDto> getAttractions(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(defaultValue = "false") boolean random
    ) {
        List<Place> places;
        if (random) {
            places = visitJejuService.getRandomPlacesByCategory("c1", limit);
        } else {
            places = visitJejuService.getPlacesByCategory("c1", offset, limit);
        }
        
        return places.stream()
                .map(p -> new AttractionDto(
                        p.getContentsId(),
                        p.getName(),
                        p.getAddress(),
                        p.getLatitude(),
                        p.getLongitude(),
                        p.getImageUrl()
                ))
                .toList();
    }

    @GetMapping("/restaurants")
    public List<AttractionDto> getRestaurants(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(defaultValue = "false") boolean random
    ) {
        List<Place> places;
        if (random) {
            places = visitJejuService.getRandomPlacesByCategory("c4", limit);
        } else {
            places = visitJejuService.getPlacesByCategory("c4", offset, limit);
        }
        
        return places.stream()
                .map(p -> new AttractionDto(
                        p.getContentsId(),
                        p.getName(),
                        p.getAddress(),
                        p.getLatitude(),
                        p.getLongitude(),
                        p.getImageUrl()
                ))
                .toList();
    }

    @GetMapping("/attractions/{contentsId}")
    public ResponseEntity<Place> getAttractionDetail(@PathVariable String contentsId) {
        try {
            Place place = visitJejuService.getPlaceByContentsId(contentsId);
            if (place == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(place);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

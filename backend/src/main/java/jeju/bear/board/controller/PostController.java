package jeju.bear.board.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.board.dto.PageResponseDto;
import jeju.bear.board.dto.PostDetailResponseDto;
import jeju.bear.board.dto.PostRequestDto;
import jeju.bear.board.dto.PostUpdateDto;
import jeju.bear.board.service.PostService;
import jeju.bear.global.common.*;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 1. 게시글 작성 -> 일정 추가 필요함
 * 2. 게시글 수정 -> 일정 수정 로직 필요
 * 어떤 요청이든 헤더에 jwt 넣고 요청하면 무조건 토큰 검사함. -> 유효하지 않으면 403
 * */

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/post")
@Tag(name = "Post", description = "게시글 관련 api")
@Slf4j
public class PostController {

    private final PostService postService;

    @Operation(summary = "게시글 작성")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> createPost(@CurrentUser User user,
                                                     @Parameter(description = "게시글 데이터(JSON)", required = true, content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PostRequestDto.class)))
                                                     @RequestPart(value = "data") PostRequestDto dto,
                                                     @Parameter(description = "이미지 파일", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
                                                     @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            postService.save(dto, user, images);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    // 일단 50개씩 페이징, 0 페이지부터 시작
    // 검색은 제목, 내용이 기준인가?
    @Operation(summary = "게시글 전체 조회")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("")
    public ResponseEntity<ApiResponse<PageResponseDto>> getPosts(@Parameter(description = "페이지 번호(0부터 시작)") @RequestParam int page, @RequestParam(required = false) String keyword) {
        try {
            PageResponseDto response = postService.findAllByPage(page, keyword);
            return ResponseEntity.ok(ApiResponse.onSuccess(response));
        }  catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "게시글 상세 조회")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostDetailResponseDto>> getPostByID(@PathVariable Long postId, @CurrentUser User user) {
        try {
            PostDetailResponseDto response = postService.findById(postId, user);
            return ResponseEntity.ok(ApiResponse.onSuccess(response));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "게시글 수정")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> updatePost(@CurrentUser User user,
                                                     @Parameter(description = "게시글 데이터(JSON)", required = true, content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PostRequestDto.class)))
                                                     @RequestPart(value = "data") PostUpdateDto dto,
                                                     @Parameter(description = "새 이미지", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
                                                     @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                                     @PathVariable Long postId) {
        try {
            postService.update(postId, dto, user, images);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "게시글 삭제")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<?>> deletePost(@PathVariable Long postId, @CurrentUser User user) {
        try {
            postService.delete(postId, user);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "게시글 좋아요")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<?>> likePost(@PathVariable Long postId, @CurrentUser User user) {
        try {
            postService.like(postId, user);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "게시글 좋아요 취소")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<PostDetailResponseDto>> deleteLike(@PathVariable Long postId, @CurrentUser User user) {
        try {
            postService.deleteLike(postId, user);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("게시글 처리 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }
}

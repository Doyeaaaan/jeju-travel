package jeju.bear.board.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.board.service.CommentService;
import jeju.bear.global.common.*;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/post")
@Tag(name = "Comment", description = "댓글 관련 api")
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping(value = "/{postId}/comment")
    public ResponseEntity<ApiResponse<?>> createComment(@CurrentUser User user, @RequestBody String content, @PathVariable Long postId) {
        try {
            commentService.createComment(postId, user, content);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 생성 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "댓글 수정")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping(value = "/{postId}/comment/{commentId}")
    public ResponseEntity<ApiResponse<?>> updateComment(@CurrentUser User user, @RequestBody String content, @PathVariable Long commentId) {
        try {
            commentService.updateComment(commentId, user, content);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 생성 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "댓글 삭제")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @DeleteMapping(value = "/{postId}/comment/{commentId}")
    public ResponseEntity<ApiResponse<?>> deleteComment(@CurrentUser User user, @PathVariable Long commentId) {
        try {
            commentService.deleteComment(commentId, user);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 생성 중 오류 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

}

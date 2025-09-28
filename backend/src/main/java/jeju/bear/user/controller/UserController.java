package jeju.bear.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.global.common.*;
import jeju.bear.user.dto.MypageResponseDto;
import jeju.bear.user.dto.PasswordChangeDto;
import jeju.bear.user.dto.ProfileUpdateDto;
import jeju.bear.user.entity.User;
import jeju.bear.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import jeju.bear.user.dto.UserDto;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/user")
@Tag(name = "User", description = "유저 관련 api")
public class UserController {

    private final UserService userService;

    @Operation(summary = "마이페이지")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/mypage")
    public ResponseEntity<ApiResponse<MypageResponseDto>> MyPage(@CurrentUser User user) {
        try {
            System.out.println("🔍 MyPage 요청 - 사용자: " + (user != null ? user.getId() : "null"));
            
            if (user == null) {
                System.out.println("❌ 사용자가 null입니다. 인증이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.onFailure(ErrorCode.UNAUTHORIZED, "인증이 필요합니다."));
            }
            
            return ResponseEntity.ok(ApiResponse.onSuccess(userService.getMyPage(user.getId())));
        } catch (CustomException e) {
            System.out.println("❌ CustomException: " + e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    // 어디까지 가능? 일단은 닉네임, 프로필사진, 비밀번호
    @Operation(summary = "프로필 편집")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - oauth2 계정은 비밀번호 변경 불가능"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PatchMapping(value = "/mypage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> updateProfile(@CurrentUser User user,
                                                        @Parameter(description = "새 프로필 정보(JSON)", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ProfileUpdateDto.class)))
                                                        @RequestPart(value = "data", required = false) String dataJson,
                                                        @Parameter(description = "이미지 파일", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
                                                        @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            System.out.println("🔧 프로필 업데이트 요청 받음 - 사용자 ID: " + user.getId());
            System.out.println("📝 JSON 데이터: " + dataJson);
            System.out.println("📸 이미지: " + (image != null ? image.getOriginalFilename() : "null"));
            
            // JSON 파싱
            ProfileUpdateDto dto = new ProfileUpdateDto();
            if (dataJson != null && !dataJson.isEmpty()) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    dto = objectMapper.readValue(dataJson, ProfileUpdateDto.class);
                } catch (Exception e) {
                    System.out.println("❌ JSON 파싱 실패: " + e.getMessage());
                }
            }
            
            userService.updateProfile(user.getId(), dto, image);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            System.out.println("❌ CustomException: " + e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "비밀번호 변경")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request - 현재 비밀번호가 일치하지 않음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - oauth2 계정은 비밀번호 변경 불가능"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 존재하지 않는 유저"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<?>> changePassword(@CurrentUser User user, @RequestBody PasswordChangeDto dto) {
        try {
            userService.changePassword(user.getId(), dto.getCurrentPassword(), dto.getNewPassword());
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "회원 탈퇴")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 존재하지 않는 유저"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @DeleteMapping("")
    public ResponseEntity<ApiResponse<?>> deleteUser(@CurrentUser User user) {
        try {
            userService.deleteById(user.getId());
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "이메일로 사용자 검색")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 존재하지 않는 유저"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<UserDto>> searchUserByEmail(@RequestParam String email) {
        try {
            User user = userService.findUserByEmail(email);
            UserDto userDto = UserDto.from(user);
            return ResponseEntity.ok(ApiResponse.onSuccess(userDto));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

}

package jeju.bear.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jeju.bear.auth.dto.*;
import jeju.bear.auth.service.RefreshTokenService;
import jeju.bear.global.common.*;
import jeju.bear.auth.service.PrincipalOAuth2UserService;
import jeju.bear.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jeju.bear.auth.model.PrincipalDetails;
import jeju.bear.user.entity.User;
import jeju.bear.user.dto.UserDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

/**
 * 로그아웃
 * oauth2 로그인도 이메일 인증 해야하나..
 * */

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Auth 관련 api")
public class AuthController {

    private final AuthService authService;
    private final PrincipalOAuth2UserService principalOAuth2UserService;
    private final RefreshTokenService refreshTokenService;

    // 5분 유효
    @Operation(summary = "이메일 인증 코드 전송")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - 이메일 중복"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/send-email")
    public ResponseEntity<ApiResponse<?>> sendCode(@RequestBody String email) {
        // JSON 문자열에서 따옴표 제거
        String cleanEmail = email.replaceAll("^\"|\"$", "");
        log.info("📧 이메일 발송 요청 받음: {}", cleanEmail);
        try {
            authService.checkEmailDuplicate(cleanEmail);
            authService.sendEmailVerifyCode(cleanEmail);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    // 10분 유효
    @Operation(summary = "이메일 인증 코드 검증")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request - 이메일 또는 코드가 일치하지 않음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<?>> verifyCode(@RequestBody VerifyCodeDto verifyCodeDto) {
        log.info("🔍 이메일 인증 코드 검증 요청 받음: email={}, code={}", verifyCodeDto.getEmail(), verifyCodeDto.getCode());
        try {
            authService.verifyCode(verifyCodeDto);
            log.info("이메일 인증 코드 검증 성공: email={}", verifyCodeDto.getEmail());
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            log.error("이메일 인증 코드 검증 실패: email={}, error={}", verifyCodeDto.getEmail(), e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생: email={}, error={}", verifyCodeDto.getEmail(), e.getMessage());
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "일반 회원가입")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - 이메일이 인증되지 않았음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - 이메일 또는 닉네임 중복"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping(value = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> join(@Parameter(description = "회원 데이터(JSON)", required = true, content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = JoinRequestDto.class)))
                                               @RequestPart(value = "data") JoinRequestDto joinRequestDto,
                                               @Parameter(description = "이미지 파일", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
                                               @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            authService.join(joinRequestDto, image);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.SIGNUP_SUCCESS));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "일반 로그인")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - 이메일 또는 비밀번호가 올바르지 않음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto loginRequestDto) {
        try {
            LoginResponseDto response = authService.login(loginRequestDto);
            return ResponseEntity.ok(ApiResponse.onSuccess(response));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    // 프론트에서 구글 로그인 -> code 받아서 백으로 전달
    // code를 구글로 보내서 access_token을 받음
    // access_token을 구글로 보내서 사용자 정보를 받아옴
    // 그리고 그거 처리해서 회원가입/로그인, jwt 발급
    // OAuth2 자동 리다이렉트 방식으로 변경되어 수동 API는 제거됨
    // 프론트엔드에서 /oauth2/authorization/google 또는 /oauth2/authorization/kakao로 리다이렉트

    @Operation(summary = "Access Token 재발급")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - 유효하지 않은 Refresh Token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/reissue-token")
    public ResponseEntity<ApiResponse<LoginResponseDto>> reissueToken(@RequestBody ReissueRequestDto dto) {
        try {
            LoginResponseDto response = refreshTokenService.reissueAccessToken(dto.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.onSuccess(response));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "임시 비밀번호 발급")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - oauth2 계정은 임시 비밀번호 발급 불가능"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<LoginResponseDto>> requestTempPassword(@RequestBody String email) {
        try {
            authService.requestTempPassword(email);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "이메일 인증 코드로 비밀번호 변경")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK - 비밀번호 변경 완료"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request - 잘못된 요청"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - 이메일 인증 미완료 또는 소셜 로그인 사용자"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 존재하지 않는 사용자"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/change-password-by-email")
    public ResponseEntity<ApiResponse<?>> changePasswordByEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String verificationCode = request.get("verificationCode");
            String newPassword = request.get("newPassword");
            
            if (email == null || verificationCode == null || newPassword == null) {
                return ResponseEntity.badRequest().body(ApiResponse.onFailure(ErrorCode.BAD_REQUEST, "필수 파라미터가 누락되었습니다."));
            }
            
            authService.changePasswordByEmail(email, verificationCode, newPassword);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "비밀번호 찾기용 이메일 인증 코드 발송")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK - 인증 코드 발송 완료"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 존재하지 않는 사용자"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - 소셜 로그인 사용자"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/send-password-reset-code")
    public ResponseEntity<ApiResponse<?>> sendPasswordResetCode(@RequestBody String email) {
        // JSON 문자열에서 따옴표 제거
        String cleanEmail = email.replaceAll("^\"|\"$", "");
        log.info("🔐 비밀번호 찾기용 이메일 인증 코드 발송 요청 받음: {}", cleanEmail);
        try {
            authService.sendPasswordResetCode(cleanEmail);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "아이디(이메일) 찾기")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK - 이메일로 아이디가 전송됨"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found - 등록되지 않은 이메일"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    public ResponseEntity<ApiResponse<?>> findId(@RequestBody String email) {
        try {
            authService.sendFindIdEmail(email);
            return ResponseEntity.ok(ApiResponse.onSuccess(SuccessCode.OK));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    @Operation(summary = "현재 사용자 정보 조회")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - 유효하지 않은 토큰"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal PrincipalDetails principalDetails) {
        try {
            if (principalDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.onFailure(ErrorCode.UNAUTHORIZED));
            }
            User user = principalDetails.getUser();
            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .profileImage(user.getProfileImage())
                    .role(user.getRole().name())
                    .provider(user.getProvider() != null ? user.getProvider().name() : null)
                    .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                    .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                    .build();
            return ResponseEntity.ok(ApiResponse.onSuccess(userDto));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(ApiResponse.onFailure(e.getErrorCode(), e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 코드 검증 중 예외 발생", e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.onFailure(ErrorCode.INTERNAL_SERVER_ERROR));
    }

}

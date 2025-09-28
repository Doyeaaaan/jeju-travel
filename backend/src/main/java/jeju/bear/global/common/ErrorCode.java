package jeju.bear.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode implements BaseResponseCode {

    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 에러, 관리자에게 문의 바랍니다."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "금지된 요청입니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청받은 리소스를 찾을 수 없습니다."),
    EMAIL_CONFLICT(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    NAME_CONFLICT(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    LOGIN_FAIL(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다."),
    CONFLICT(HttpStatus.CONFLICT, "리소스가 충돌됩니다."),
    TRIP_PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "여행 계획을 찾을 수 없습니다."),
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    ALREADY_SHARED(HttpStatus.CONFLICT, "이미 공유된 여행 계획입니다."),
    DESTINATION_NOT_FOUND(HttpStatus.NOT_FOUND, "목적지를 찾을 수 없습니다."),
    INVALID_DESTINATION_ORDER(HttpStatus.BAD_REQUEST, "잘못된 목적지 순서입니다."),
    DESTINATION_TIME_CONFLICT(HttpStatus.CONFLICT, "해당 시간에 이미 다른 목적지가 존재합니다."),
    TRIP_DAY_NOT_FOUND(HttpStatus.NOT_FOUND, "여행 일자를 찾을 수 없습니다."),
    INVALID_TRIP_DAY(HttpStatus.BAD_REQUEST, "잘못된 여행 일자입니다."),
    INVALID_DESTINATION(HttpStatus.BAD_REQUEST, "잘못된 목적지입니다."),
    MAX_DESTINATIONS_EXCEEDED(HttpStatus.BAD_REQUEST, "하루 최대 목적지 수를 초과했습니다."),
    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다."),
    INVALID_COORDINATES(HttpStatus.BAD_REQUEST, "잘못된 좌표값입니다."),
    INVALID_SEARCH_RADIUS(HttpStatus.BAD_REQUEST, "잘못된 검색 반경입니다."),
    INVALID_CATEGORY_CODE(HttpStatus.BAD_REQUEST, "잘못된 카테고리 코드입니다."),
    API_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "API 호출 한도를 초과했습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    INVALID_DATE_RANGE(HttpStatus.BAD_REQUEST, "잘못된 날짜 범위입니다."),
    INVALID_FRIEND_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 친구 요청입니다."),
    ALREADY_FRIEND(HttpStatus.CONFLICT, "이미 친구입니다."),
    DUPLICATE_FRIEND_REQUEST(HttpStatus.CONFLICT, "중복된 친구 요청입니다."),
    FRIEND_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "친구 요청을 찾을 수 없습니다."),
    UNAUTHORIZED_FRIEND_REQUEST(HttpStatus.FORBIDDEN, "친구 요청에 대한 권한이 없습니다."),
    INVALID_FRIEND_REQUEST_STATUS(HttpStatus.BAD_REQUEST, "잘못된 친구 요청 상태입니다."),
    FRIEND_NOT_FOUND(HttpStatus.NOT_FOUND, "친구 관계를 찾을 수 없습니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    OAUTH2_USER_PASSWORD_UPDATE_DENIED(HttpStatus.FORBIDDEN, "OAuth2 사용자는 비밀번호를 변경할 수 없습니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다."),
    ALREADY_LIKED(HttpStatus.CONFLICT, "이미 좋아요를 누른 게시글입니다."),
    LIKE_NOT_FOUND(HttpStatus.NOT_FOUND, "좋아요를 누르지 않은 게시글입니다.")
    ;

    private final HttpStatus httpStatus;
    private final String message;
}

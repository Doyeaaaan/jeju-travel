package jeju.bear.global.common;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@JsonPropertyOrder({"status", "message", "data"})
public class ApiResponse<T> {

    private final String status;
    private final String message;
    private final T data;

    // 성공한 경우의 응답
    public static <T> ApiResponse<T> onSuccess(SuccessCode successCode) {
        String status = successCode.getHttpStatus().value() + " " + successCode.getHttpStatus().getReasonPhrase();
        return new ApiResponse<>(status, successCode.getMessage(), null);
    }
    public static <T> ApiResponse<T> onSuccess(T data) {
        return new ApiResponse<>("200 OK", SuccessCode.OK.getMessage(), data);
    }

    // 실패한 경우의 응답
    public static <T> ApiResponse<T> onFailure(ErrorCode errorCode) {
        String status = errorCode.getHttpStatus().value() + " " + errorCode.getHttpStatus().getReasonPhrase();
        return new ApiResponse<>(status, errorCode.getMessage(), null);
    }

    public static <T> ApiResponse<T> onFailure(ErrorCode errorCode, String message) {
        String status = errorCode.getHttpStatus().value() + " " + errorCode.getHttpStatus().getReasonPhrase();
        return new ApiResponse<>(status, message, null);
    }
}

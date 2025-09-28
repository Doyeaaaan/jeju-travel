package jeju.bear.global.common;

import org.springframework.http.HttpStatus;

public interface BaseResponseCode {

    HttpStatus getHttpStatus();

    String getMessage();

}

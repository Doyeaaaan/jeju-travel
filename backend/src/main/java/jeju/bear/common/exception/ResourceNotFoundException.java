package jeju.bear.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "RSC001");
    }

    public static ResourceNotFoundException of(String resourceName, Object identifier) {
        return new ResourceNotFoundException(
            String.format("%s를 찾을 수 없습니다. (ID: %s)", resourceName, identifier)
        );
    }
} 
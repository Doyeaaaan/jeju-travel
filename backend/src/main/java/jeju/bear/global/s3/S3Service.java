package jeju.bear.global.s3;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
    String uploadFile(MultipartFile file);
    String uploadFile(MultipartFile file, String folder);
    void deleteFile(String fileUrl);
    String getFileUrl(String fileName);
} 
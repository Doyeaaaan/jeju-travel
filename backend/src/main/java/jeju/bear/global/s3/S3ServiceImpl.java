package jeju.bear.global.s3;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

@Service
public class S3ServiceImpl implements S3Service {

    @Value("${aws.s3.bucket-name:jeju-bear-bucket}")
    private String bucketName;

    @Value("${aws.s3.region:ap-northeast-2}")
    private String region;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    private AmazonS3 s3Client;

    @PostConstruct
    public void init() {
        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        this.s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                originalFilename = "uploaded_file";
            }
            String fileName = generateFileName(originalFilename);
            String folder = "profile-images";
            String key = folder + "/" + fileName;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            PutObjectRequest putRequest = new PutObjectRequest(bucketName, key, file.getInputStream(), metadata);
            s3Client.putObject(putRequest);

            String fileUrl = s3Client.getUrl(bucketName, key).toString();
            System.out.println("✅ S3 업로드 성공: " + fileUrl);
            return fileUrl;

        } catch (IOException e) {
            System.err.println("❌ S3 업로드 실패: " + e.getMessage());
            return "temp-file-url-" + file.getOriginalFilename();
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String fileName = generateFileName(file.getOriginalFilename());
            String key = folder + "/" + fileName;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            PutObjectRequest putRequest = new PutObjectRequest(bucketName, key, file.getInputStream(), metadata);
            s3Client.putObject(putRequest);

            String fileUrl = s3Client.getUrl(bucketName, key).toString();
            System.out.println("✅ S3 업로드 성공: " + fileUrl);
            return fileUrl;

        } catch (IOException e) {
            System.err.println("❌ S3 업로드 실패: " + e.getMessage());
            return "temp-file-url-" + folder + "/" + file.getOriginalFilename();
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.startsWith("temp-file-url-")) {
            System.out.println("🗑️ 임시 파일 삭제 스킵: " + fileUrl);
            return;
        }

        try {
            // S3 URL에서 키 추출
            String key = extractKeyFromUrl(fileUrl);
            if (key != null) {
                s3Client.deleteObject(new DeleteObjectRequest(bucketName, key));
                System.out.println("✅ S3 파일 삭제 성공: " + fileUrl);
            }
        } catch (Exception e) {
            System.err.println("❌ S3 파일 삭제 실패: " + e.getMessage());
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        return s3Client.getUrl(bucketName, fileName).toString();
    }

    private String generateFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private String extractKeyFromUrl(String fileUrl) {
        try {
            // S3 URL에서 키 추출 (예: https://bucket-name.s3.region.amazonaws.com/folder/file.jpg)
            String[] parts = fileUrl.split("/");
            if (parts.length >= 4) {
                return parts[3] + "/" + parts[4]; // folder/file.jpg
            }
        } catch (Exception e) {
            System.err.println("URL에서 키 추출 실패: " + e.getMessage());
        }
        return null;
    }
}
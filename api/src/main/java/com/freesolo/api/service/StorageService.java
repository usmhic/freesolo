package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.exception.ApiException;
import io.minio.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    private final MinioClient minio;
    private final String bucket;
    private final String publicUrl;

    public StorageService(AppProperties props) {
        AppProperties.Minio cfg = props.getMinio();
        this.bucket = cfg.getBucket();
        this.publicUrl = cfg.getPublicUrl().replaceAll("/+$", "");
        MinioClient client = null;
        try {
            client = MinioClient.builder()
                    .endpoint(cfg.getEndpoint())
                    .credentials(cfg.getAccessKey(), cfg.getSecretKey())
                    .build();
            ensureBucket(client);
        } catch (Exception e) {
            log.warn("MinIO not available: {}. File uploads will fail.", e.getMessage());
        }
        this.minio = client;
    }

    private void ensureBucket(MinioClient client) {
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                client.setBucketPolicy(SetBucketPolicyArgs.builder()
                        .bucket(bucket)
                        .config("{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\"," +
                                "\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"]," +
                                "\"Resource\":[\"arn:aws:s3:::" + bucket + "/*\"]}]}")
                        .build());
            }
        } catch (Exception e) {
            log.warn("Could not ensure MinIO bucket: {}", e.getMessage());
        }
    }

    public record UploadResult(String url, String key, long size) {}

    public UploadResult upload(MultipartFile file, String type, String userId) {
        if (minio == null) throw ApiException.internal("Storage not configured");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw ApiException.badRequest("Unsupported file type. Allowed: JPEG, PNG, WEBP, HEIC, HEIF");
        }
        if (file.getSize() > MAX_SIZE) {
            throw ApiException.badRequest("File exceeds 10 MB limit");
        }

        String ext = extension(contentType);
        String month = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String key = type + "/" + userId + "/" + month + "/" + UUID.randomUUID() + ext;

        try {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .stream(file.getInputStream(), file.getSize(), -1L)
                    .contentType(contentType)
                    .build());

            return new UploadResult(publicUrl + "/" + bucket + "/" + key, key, file.getSize());
        } catch (Exception e) {
            log.error("Upload failed: {}", e.getMessage());
            throw ApiException.internal("Upload failed");
        }
    }

    public void delete(String key) {
        if (minio == null) return;
        try {
            minio.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(key).build());
        } catch (Exception e) {
            log.warn("Failed to delete object {}: {}", key, e.getMessage());
        }
    }

    private String extension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/heic" -> ".heic";
            case "image/heif" -> ".heif";
            default -> "";
        };
    }
}

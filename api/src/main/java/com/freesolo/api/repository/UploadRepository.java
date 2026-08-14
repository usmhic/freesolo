package com.freesolo.api.repository;

import com.freesolo.api.entity.Upload;
import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UploadRepository extends JpaRepository<Upload, String> {
    Optional<Upload> findByKey(String key);
    Page<Upload> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}

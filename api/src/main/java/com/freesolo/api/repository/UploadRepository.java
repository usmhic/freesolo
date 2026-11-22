package com.freesolo.api.repository;

import com.freesolo.api.entity.Upload;
import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadRepository extends JpaRepository<Upload, String> {
    Page<Upload> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}

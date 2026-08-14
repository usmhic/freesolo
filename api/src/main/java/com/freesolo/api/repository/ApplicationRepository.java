package com.freesolo.api.repository;

import com.freesolo.api.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, String> {
    Page<Application> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);
}

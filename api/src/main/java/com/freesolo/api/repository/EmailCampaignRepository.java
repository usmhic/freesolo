package com.freesolo.api.repository;

import com.freesolo.api.entity.EmailCampaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, String> {
    Page<EmailCampaign> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<EmailCampaign> findByStatusAndScheduledAtBefore(String status, LocalDateTime now);
}

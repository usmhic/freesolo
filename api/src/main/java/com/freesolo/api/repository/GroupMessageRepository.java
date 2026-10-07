package com.freesolo.api.repository;

import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.GroupMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, String> {

    /** Newest first; callers reverse for display. */
    List<GroupMessage> findByExperienceOrderByCreatedAtDesc(Experience experience, Pageable pageable);

    List<GroupMessage> findByExperienceAndCreatedAtAfterOrderByCreatedAtAsc(
            Experience experience, LocalDateTime after, Pageable pageable);

    Optional<GroupMessage> findFirstByExperienceOrderByCreatedAtDesc(Experience experience);
}

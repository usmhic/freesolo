package com.freesolo.api.repository;

import com.freesolo.api.entity.EventPhoto;
import com.freesolo.api.entity.Experience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventPhotoRepository extends JpaRepository<EventPhoto, String> {
    List<EventPhoto> findByExperience(Experience experience);
    Page<EventPhoto> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

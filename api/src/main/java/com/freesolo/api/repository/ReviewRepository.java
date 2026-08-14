package com.freesolo.api.repository;

import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, String> {
    boolean existsByBooking(Booking booking);

    @Query("SELECT r FROM Review r WHERE " +
           "(:experienceId IS NULL OR r.experience.id = :experienceId) " +
           "AND (:hostId IS NULL OR r.target.id = :hostId)")
    Page<Review> findFiltered(@Param("experienceId") String experienceId,
                               @Param("hostId") String hostId,
                               Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.experience.business.id = :businessId ORDER BY r.createdAt DESC")
    Page<Review> findByExperienceBusinessId(@Param("businessId") String businessId, Pageable pageable);
}

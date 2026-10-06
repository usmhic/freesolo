package com.freesolo.api.repository;

import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExperienceRepository extends JpaRepository<Experience, String> {

    @Query("SELECT e FROM Experience e WHERE " +
           "e.status = 'active' " +
           "AND (:kind IS NULL OR e.kind = CAST(:kind AS string)) " +
           "AND (:city IS NULL OR LOWER(e.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
           "AND (:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', CAST(:category AS string), '%')))")
    Page<Experience> findActive(@Param("kind") String kind,
                                 @Param("city") String city,
                                 @Param("category") String category,
                                 Pageable pageable);

    /** Locks the listing row so concurrent joins cannot oversell its seats. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Experience e WHERE e.id = :id")
    Optional<Experience> findByIdForUpdate(@Param("id") String id);

    List<Experience> findByFeaturedTrueAndStatus(String status);
    List<Experience> findByHost(User host);
    List<Experience> findByHostOrderByCreatedAtDesc(User host);
    List<Experience> findByBusinessId(String businessId);
    long countByStatus(String status);

    @Query("SELECT e FROM Experience e WHERE e.business.id = :businessId ORDER BY e.createdAt DESC")
    Page<Experience> findByBusinessIdPaged(@Param("businessId") String businessId, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Experience e WHERE e.status = :status AND e.business.id = :businessId")
    long countByStatusAndBusinessId(@Param("status") String status, @Param("businessId") String businessId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.experience = :experience AND b.status IN ('pending', 'confirmed')")
    long countActiveBookings(@Param("experience") Experience experience);
}

package com.freesolo.api.repository;

import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> search(@Param("query") String query,
                      @Param("role") String role,
                      @Param("status") String status,
                      Pageable pageable);

    List<User> findByMarketingOptInTrue();

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'approved' AND u.marketingOptIn = true")
    List<User> findApprovedByRole(@Param("role") String role);

    List<User> findByStatus(String status);

    long countByMarketingOptInTrueAndStatus(String status);
    long countByMarketingOptInTrueAndStatusAndRole(String status, String role);

    @Query("SELECT COUNT(DISTINCT u) FROM User u LEFT JOIN u.experiences e WHERE u.marketingOptIn = true AND u.status = 'approved' AND (u.role = 'business' OR e.id IS NOT NULL)")
    long countMarketingHosts();

    @Query("SELECT COUNT(u) FROM User u WHERE u.marketingOptIn = true AND u.status = 'approved' AND u.id NOT IN (SELECT b.user.id FROM Booking b WHERE b.createdAt >= :since)")
    long countMarketingInactive(@Param("since") java.time.LocalDateTime since);
}

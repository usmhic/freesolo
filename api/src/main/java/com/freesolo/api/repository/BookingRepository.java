package com.freesolo.api.repository;

import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, String> {
    Page<Booking> findByUser(User user, Pageable pageable);
    List<Booking> findByExperienceAndStatus(Experience experience, String status);
    List<Booking> findByExperienceAndStatusIn(Experience experience, List<String> statuses);
    Optional<Booking> findByStripePaymentIntentId(String stripePaymentIntentId);
    long countByExperienceAndStatusIn(Experience experience, List<String> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.experience = :experience AND b.status IN ('pending', 'confirmed')")
    long countFilledSeats(@Param("experience") Experience experience);

    Page<Booking> findByStatus(String status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.experience.business.id = :businessId")
    Page<Booking> findByExperienceBusinessId(@Param("businessId") String businessId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.experience.business.id = :businessId")
    Page<Booking> findByStatusAndExperienceBusinessId(@Param("status") String status, @Param("businessId") String businessId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.amountTotal), 0) FROM Booking b WHERE b.status IN :statuses AND b.createdAt >= :since")
    Double sumAmountTotalSince(@Param("statuses") List<String> statuses, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(b.amountTotal), 0) FROM Booking b WHERE b.status IN :statuses AND b.experience.business.id = :businessId AND b.createdAt >= :since")
    Double sumAmountTotalForBusinessSince(@Param("statuses") List<String> statuses, @Param("businessId") String businessId, @Param("since") LocalDateTime since);
}

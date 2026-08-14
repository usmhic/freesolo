package com.freesolo.api.repository;

import com.freesolo.api.entity.Payout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PayoutRepository extends JpaRepository<Payout, String> {
    Page<Payout> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);

    @Query("SELECT p FROM Payout p WHERE p.status = :status AND p.host.id = :hostId")
    Page<Payout> findByStatusAndHostId(@Param("status") String status, @Param("hostId") String hostId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Payout p WHERE p.status = :status AND p.host.id = :hostId")
    long countByStatusAndHostId(@Param("status") String status, @Param("hostId") String hostId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payout p WHERE p.status = :status")
    Double sumAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payout p WHERE p.status = :status AND p.host.id = :hostId")
    Double sumAmountByStatusAndHostId(@Param("status") String status, @Param("hostId") String hostId);
}

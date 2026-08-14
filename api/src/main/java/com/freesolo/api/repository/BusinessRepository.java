package com.freesolo.api.repository;

import com.freesolo.api.entity.Business;
import com.freesolo.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BusinessRepository extends JpaRepository<Business, String> {
    List<Business> findByOwner(User owner);
    Optional<Business> findFirstByOwnerOrderByCreatedAtAsc(User owner);

    @Query("SELECT b FROM Business b WHERE " +
           "b.status = 'approved' " +
           "AND (:city IS NULL OR LOWER(b.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
           "AND (:type IS NULL OR b.type = :type)")
    Page<Business> findApproved(@Param("city") String city,
                                 @Param("type") String type,
                                 Pageable pageable);

    Page<Business> findAll(Pageable pageable);
    long countByStatus(String status);
}

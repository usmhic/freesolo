package com.freesolo.api.repository;

import com.freesolo.api.entity.OtpCode;
import com.freesolo.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, String> {
    Optional<OtpCode> findTopByUserAndCodeAndExpiresAtAfterOrderByCreatedAtDesc(
            User user, String code, LocalDateTime now);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.user = :user")
    void deleteByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);
}

package com.freesolo.api.repository;

import com.freesolo.api.entity.PaymentMethod;
import com.freesolo.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {
    List<PaymentMethod> findByUser(User user);
    Optional<PaymentMethod> findByUserAndIsDefaultTrue(User user);

    @Modifying
    @Query("UPDATE PaymentMethod pm SET pm.isDefault = false WHERE pm.user = :user")
    void clearDefault(@Param("user") User user);
}

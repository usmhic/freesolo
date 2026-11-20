package com.freesolo.api.repository;

import com.freesolo.api.entity.CityUnlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityUnlockRepository extends JpaRepository<CityUnlock, String> {
    List<CityUnlock> findByUserId(String userId);

    boolean existsByUserIdAndCityId(String userId, String cityId);
}

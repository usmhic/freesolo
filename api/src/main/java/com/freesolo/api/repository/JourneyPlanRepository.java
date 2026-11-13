package com.freesolo.api.repository;

import com.freesolo.api.entity.JourneyPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JourneyPlanRepository extends JpaRepository<JourneyPlan, String> {
    List<JourneyPlan> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);
    long countByOwnerId(String ownerId);
}

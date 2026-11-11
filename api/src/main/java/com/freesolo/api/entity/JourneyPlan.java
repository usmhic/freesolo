package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

/** A member's saved journey: ordered stops and the route between them. */
@Entity
@Table(name = "fs_journey_plans", schema = DomainSchemas.PLANNING)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyPlan {

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, updatable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 64)
    private String profile;

    @Column(name = "start_date", length = 32)
    private String startDate;

    /** JSON array of {@code {name, lat, lng, day, note}}. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String stops;

    /** JSON of the last computed route, or null when there are fewer than two stops. */
    @Column(columnDefinition = "TEXT")
    private String route;

    @Column(name = "distance_meters", nullable = false)
    private double distanceMeters;

    @Column(name = "duration_seconds", nullable = false)
    private double durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}

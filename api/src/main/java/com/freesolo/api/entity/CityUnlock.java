package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

/** A city pack a player has unlocked: every lesson in that city, for good. */
@Entity
@Table(name = "fs_city_unlocks", schema = DomainSchemas.PLAY)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityUnlock {

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36, updatable = false)
    private String userId;

    @Column(name = "city_id", nullable = false, length = 64)
    private String cityId;

    @Column(name = "unlocked_at", nullable = false)
    @Builder.Default
    private LocalDateTime unlockedAt = LocalDateTime.now();
}

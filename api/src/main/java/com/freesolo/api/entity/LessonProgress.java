package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

/** A lesson a player has solved, and the stardust it earned them. */
@Entity
@Table(name = "fs_lesson_progress", schema = DomainSchemas.PLAY)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36, updatable = false)
    private String userId;

    @Column(name = "city_id", nullable = false, length = 64)
    private String cityId;

    @Column(name = "lesson_id", nullable = false, length = 64)
    private String lessonId;

    @Column(nullable = false)
    private int stardust;

    @Column(name = "hints_used", nullable = false)
    private int hintsUsed;

    @Column(name = "solved_at", nullable = false)
    @Builder.Default
    private LocalDateTime solvedAt = LocalDateTime.now();
}

package com.freesolo.api.repository;

import com.freesolo.api.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
    List<LessonProgress> findByUserIdOrderBySolvedAtDesc(String userId);

    boolean existsByUserIdAndLessonId(String userId, String lessonId);
}

package com.freesolo.api.repository;

import com.freesolo.api.entity.LessonProgress;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
    List<LessonProgress> findByUserIdOrderBySolvedAtDesc(String userId);

    /** A player's total in the ranking window. */
    interface Total {
        String getUserId();
        long getStardust();
        long getSolved();
        long getCities();
    }

    /** Players by stardust earned since {@code since}; ties go to whoever got there first. */
    @Query("""
            select p.userId as userId, sum(p.stardust) as stardust, count(p) as solved, count(distinct p.cityId) as cities
            from LessonProgress p where p.solvedAt >= :since
            group by p.userId order by sum(p.stardust) desc, max(p.solvedAt) asc""")
    List<Total> ranking(@Param("since") LocalDateTime since, Pageable page);

    @Query("""
            select p.userId as userId, sum(p.stardust) as stardust, count(p) as solved, count(distinct p.cityId) as cities
            from LessonProgress p where p.solvedAt >= :since and p.userId = :userId group by p.userId""")
    List<Total> totalFor(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query(value = """
            select count(*) from (select user_id from play.fs_lesson_progress where solved_at >= :since
              group by user_id having sum(stardust) > :stardust) ahead""", nativeQuery = true)
    long playersAhead(@Param("since") LocalDateTime since, @Param("stardust") long stardust);

    @Query("select count(distinct p.userId) from LessonProgress p where p.solvedAt >= :since")
    long players(@Param("since") LocalDateTime since);

    /** All-time stardust for these players, so the ranking can show each one's star rank. */
    @Query("select p.userId as userId, sum(p.stardust) as stardust, count(p) as solved, count(distinct p.cityId) as cities "
            + "from LessonProgress p where p.userId in :ids group by p.userId")
    List<Total> allTime(@Param("ids") Collection<String> ids);
}

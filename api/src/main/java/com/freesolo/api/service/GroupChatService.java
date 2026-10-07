package com.freesolo.api.service;

import com.freesolo.api.dto.chat.GroupMessageResponse;
import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.GroupMessage;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.ExperienceRepository;
import com.freesolo.api.repository.GroupMessageRepository;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * A listing's group chat. The host and every traveler holding a seat can read
 * and post; a join request still awaiting the host does not grant access.
 */
@Service
@RequiredArgsConstructor
public class GroupChatService {

    /** Seat-holding statuses, including past trips so the group can keep talking afterwards. */
    private static final List<String> MEMBER_STATUSES =
            List.of(Booking.PENDING, Booking.CONFIRMED, Booking.COMPLETED);

    private static final int PAGE_SIZE = 100;

    /**
     * Polls re-read this far behind the client's cursor, so a message that
     * committed slightly after a later-stamped one is still delivered.
     * Clients dedupe by message id.
     */
    static final Duration POLL_OVERLAP = Duration.ofMinutes(1);

    /** Members are notified only when a chat wakes up, not for every message in a busy thread. */
    static final Duration NOTIFY_AFTER_QUIET = Duration.ofMinutes(30);

    private final GroupMessageRepository messageRepository;
    private final ExperienceRepository experienceRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * The latest messages, oldest first. With {@code after}, messages newer than
     * it, plus a short {@link #POLL_OVERLAP} that clients dedupe by id.
     */
    public List<GroupMessageResponse> list(String userId, String experienceId, LocalDateTime after) {
        Experience exp = loadExperience(experienceId);
        requireMember(exp, userRepository.findById(userId).orElseThrow());

        if (after != null) {
            return messageRepository.findByExperienceAndCreatedAtAfterOrderByCreatedAtAsc(
                            exp, after.minus(POLL_OVERLAP), PageRequest.of(0, PAGE_SIZE))
                    .stream().map(GroupMessageResponse::from).toList();
        }
        List<GroupMessage> latest = new ArrayList<>(
                messageRepository.findByExperienceOrderByCreatedAtDesc(exp, PageRequest.of(0, PAGE_SIZE)));
        Collections.reverse(latest);
        return latest.stream().map(GroupMessageResponse::from).toList();
    }

    @Transactional
    public GroupMessageResponse post(String userId, String experienceId, String body) {
        Experience exp = loadExperience(experienceId);
        User author = userRepository.findById(userId).orElseThrow();
        requireMember(exp, author);

        // Postgres keeps microseconds; truncating here makes the returned
        // timestamp identical to the stored one, so it works as a poll cursor.
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
        boolean wasQuiet = messageRepository.findFirstByExperienceOrderByCreatedAtDesc(exp)
                .map(last -> last.getCreatedAt().isBefore(now.minus(NOTIFY_AFTER_QUIET)))
                .orElse(true);

        GroupMessage saved = messageRepository.save(GroupMessage.builder()
                .experience(exp)
                .author(author)
                .body(body.trim())
                .createdAt(now)
                .build());

        if (wasQuiet) notifyOthers(exp, author);
        return GroupMessageResponse.from(saved);
    }

    private void notifyOthers(Experience exp, User author) {
        String who = author.getName() != null && !author.getName().isBlank() ? author.getName() : "Someone";
        Map<String, Object> data = Map.of("experienceId", exp.getId());

        List<String> recipients = new ArrayList<>();
        recipients.add(exp.getHost().getId());
        bookingRepository.findByExperienceAndStatusInOrderByCreatedAtAsc(exp, MEMBER_STATUSES)
                .forEach(b -> recipients.add(b.getUser().getId()));

        recipients.stream().distinct()
                .filter(id -> !id.equals(author.getId()))
                .forEach(id -> notificationService.create(id, "group_message",
                        "New in " + exp.getTitle() + " 💬",
                        who + " wrote in the group chat.", data));
    }

    private Experience loadExperience(String experienceId) {
        return experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
    }

    private void requireMember(Experience exp, User user) {
        boolean host = exp.getHost().getId().equals(user.getId());
        if (!host && !bookingRepository.existsByUserAndExperienceAndStatusIn(user, exp, MEMBER_STATUSES)) {
            throw ApiException.forbidden("The group chat opens once you have a place in the group");
        }
    }
}

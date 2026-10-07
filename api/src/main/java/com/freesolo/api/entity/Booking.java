package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fs_bookings", schema = DomainSchemas.BOOKINGS)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    /** Waiting for the host to accept a join request; holds no seat. */
    public static final String REQUESTED = "requested";
    /** Seat held; the group has not reached its minimum yet. */
    public static final String PENDING = "pending";
    public static final String CONFIRMED = "confirmed";
    public static final String DECLINED = "declined";
    public static final String CANCELLED = "cancelled";
    public static final String COMPLETED = "completed";
    public static final String REFUNDED = "refunded";

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id", nullable = false)
    private Experience experience;

    @Builder.Default
    private int seats = 1;

    @Builder.Default
    private String status = PENDING;

    @Column(name = "guest_note")
    private String guestNote;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Review review;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventPhoto> eventPhotos = new ArrayList<>();
}

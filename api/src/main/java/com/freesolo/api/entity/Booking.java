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
    private String status = "pending";

    @Column(name = "amount_total", nullable = false)
    private double amountTotal;

    @Column(name = "amount_venue", nullable = false)
    private double amountVenue;

    @Column(name = "amount_host_credit", nullable = false)
    private double amountHostCredit;

    @Column(name = "amount_platform", nullable = false)
    private double amountPlatform;

    @Builder.Default
    private String currency = "EUR";

    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;

    @Column(name = "stripe_charge_id")
    private String stripeChargeId;

    @Column(name = "stripe_paid_at")
    private LocalDateTime stripePaidAt;

    @Column(name = "guest_note")
    private String guestNote;

    @Column(name = "cancel_reason")
    private String cancelReason;

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

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payout payout;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventPhoto> eventPhotos = new ArrayList<>();
}

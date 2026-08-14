package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fs_experiences", schema = DomainSchemas.EXPERIENCES)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Builder.Default
    private String emoji = "🌍";

    @Column(nullable = false)
    private String city;

    @Builder.Default
    private String country = "PT";

    private Double lat;
    private Double lng;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String time;

    @Column(name = "duration_mins")
    @Builder.Default
    private int durationMins = 120;

    @Column(name = "min_seats")
    @Builder.Default
    private int minSeats = 4;

    @Column(name = "max_seats")
    @Builder.Default
    private int maxSeats = 8;

    @Column(nullable = false)
    private double price;

    @Builder.Default
    private String currency = "EUR";

    @Column(name = "cover_image")
    private String coverImage;

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String images = "[]";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String tags = "[]";

    @Builder.Default
    private String status = "active";

    @Builder.Default
    private boolean featured = false;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventPhoto> eventPhotos = new ArrayList<>();
}

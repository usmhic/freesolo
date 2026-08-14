package com.freesolo.api.entity;

import com.freesolo.api.module.DomainSchemas;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fs_businesses", schema = DomainSchemas.PARTNERS)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Builder.Default
    private String country = "PT";

    private Double lat;
    private Double lng;

    @Column(name = "maps_link")
    private String mapsLink;

    private String tripadvisor;
    private String instagram;
    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String images = "[]";

    @Builder.Default
    private String status = "pending";

    @Column(name = "stripe_account_id")
    private String stripeAccountId;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Experience> experiences = new ArrayList<>();
}

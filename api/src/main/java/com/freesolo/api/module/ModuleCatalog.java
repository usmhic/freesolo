package com.freesolo.api.module;

import java.util.List;

/**
 * Stable ownership map for FreeSolo's modular monolith. Modules communicate
 * through in-process services today; the dependency list shows where a future
 * service boundary may be introduced without changing the public API.
 */
public final class ModuleCatalog {
    public static final List<Module> ALL = List.of(
            new Module("identity", DomainSchemas.IDENTITY,
                    "Users, authentication, OAuth accounts, and one-time codes", List.of()),
            new Module("partners", DomainSchemas.PARTNERS,
                    "Host applications and business profiles", List.of("identity")),
            new Module("experiences", DomainSchemas.EXPERIENCES,
                    "Experience catalog and reviews", List.of("identity", "partners")),
            new Module("bookings", DomainSchemas.BOOKINGS,
                    "Reservations and lifecycle state", List.of("identity", "experiences")),
            new Module("billing", DomainSchemas.BILLING,
                    "Payment methods and host payouts", List.of("identity", "bookings")),
            new Module("engagement", DomainSchemas.ENGAGEMENT,
                    "Notifications and email campaigns", List.of("identity")),
            new Module("media", DomainSchemas.MEDIA,
                    "Uploads and event photos", List.of("identity", "experiences", "bookings"))
    );

    private ModuleCatalog() {
    }

    public record Module(String name, String schema, String responsibility, List<String> dependsOn) {
    }
}

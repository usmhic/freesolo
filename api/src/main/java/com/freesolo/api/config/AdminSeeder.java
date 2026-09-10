package com.freesolo.api.config;

import com.freesolo.api.entity.User;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Guarantees the ADMIN_EMAIL account exists and holds the admin role on every
 * startup.
 *
 * AuthService and ApplicationService already promote this address, but only at
 * the moment it first signs in or applies — so a fresh database has no admin
 * until someone happens to log in with the right email. This closes that gap:
 * the account is created up front, and an existing one is promoted if its role
 * drifted.
 *
 * Runs as an ApplicationRunner, so it fires after the context is refreshed and
 * Flyway has migrated. It never demotes anyone.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private static final String ADMIN_ROLE    = "admin";
    private static final String APPROVED      = "approved";

    private final AppProperties props;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String configured = props.getAdminEmail();
        if (!StringUtils.hasText(configured)) {
            log.warn("ADMIN_EMAIL is not set — skipping admin seeding, no account has the admin role");
            return;
        }

        // Stored lowercase everywhere else (see AuthService), so match on that.
        String email = configured.trim().toLowerCase();

        userRepository.findByEmail(email).ifPresentOrElse(
                existing -> promoteIfNeeded(existing, email),
                () -> seed(email));
    }

    private void promoteIfNeeded(User user, String email) {
        if (ADMIN_ROLE.equals(user.getRole()) && APPROVED.equals(user.getStatus())) {
            log.debug("Admin account {} already in place", email);
            return;
        }
        user.setRole(ADMIN_ROLE);
        user.setStatus(APPROVED);
        userRepository.save(user);
        log.info("Promoted existing account {} to admin", email);
    }

    private void seed(String email) {
        // Sign-in is passwordless, so there is nothing to set beyond the role —
        // the holder of this mailbox signs in with an OTP.
        User admin = User.builder()
                .email(email)
                .name("Admin")
                .role(ADMIN_ROLE)
                .status(APPROVED)
                .emailVerified(true)
                .marketingOptIn(false)
                .build();
        userRepository.save(admin);
        log.info("Seeded admin account {}", email);
    }
}

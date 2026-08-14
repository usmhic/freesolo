package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.application.ApplicationResponse;
import com.freesolo.api.dto.application.CreateApplicationRequest;
import com.freesolo.api.dto.application.ReviewApplicationRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.entity.Application;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.ApplicationRepository;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AppProperties props;

    @Transactional
    public ApplicationResponse submit(CreateApplicationRequest req) {
        String email = req.email().toLowerCase().trim();

        // Find or create user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(req.name().trim())
                    .build();
            // Auto-promote admin
            if (email.equalsIgnoreCase(props.getAdminEmail())) {
                newUser.setRole("admin");
                newUser.setStatus("approved");
            }
            return userRepository.save(newUser);
        });

        Application app = Application.builder()
                .user(user)
                .story(req.story().trim())
                .imageUrl(req.imageUrl())
                .build();
        app = applicationRepository.save(app);

        emailService.sendApplicationReceived(email);

        return ApplicationResponse.from(app);
    }

    public PageResponse<ApplicationResponse> list(String status, int page, int limit) {
        String statusFilter = status != null && !status.isBlank() ? status : "pending";
        Page<Application> result = applicationRepository.findByStatus(
                statusFilter, PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));
        List<ApplicationResponse> responses = result.getContent().stream().map(ApplicationResponse::from).toList();
        return PageResponse.of(responses, result.getTotalElements(), page, limit);
    }

    @Transactional
    public ApplicationResponse review(String applicationId, ReviewApplicationRequest req) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found"));

        app.setStatus(req.decision());
        app.setReviewNote(req.reviewNote());
        app.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(app);

        User user = app.getUser();
        user.setStatus("approved".equals(req.decision()) ? "approved" : "rejected");
        if ("approved".equals(req.decision())) {
            user.setEmailVerified(true);
            emailService.sendApplicationApproved(user.getEmail());
        }
        userRepository.save(user);

        String title = "approved".equals(req.decision())
                ? "Your application was approved! 🎉"
                : "Update on your application";
        String body = "approved".equals(req.decision())
                ? "Welcome to FreeSolo — open the app and sign in with this email."
                : (req.reviewNote() != null ? req.reviewNote() : "Thanks for applying — we can't offer you a spot at this time.");

        notificationService.create(user.getId(), "application_reviewed", title, body, null);

        return ApplicationResponse.from(app);
    }
}

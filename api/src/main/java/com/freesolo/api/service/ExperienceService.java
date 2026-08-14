package com.freesolo.api.service;

import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.experience.CreateExperienceRequest;
import com.freesolo.api.dto.experience.ExperienceResponse;
import com.freesolo.api.entity.Business;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.BusinessRepository;
import com.freesolo.api.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final BusinessRepository businessRepository;
    private final BookingRepository bookingRepository;

    public PageResponse<ExperienceResponse> list(String city, String category, int page, int limit) {
        String cityParam     = city     != null && !city.isBlank()     ? city     : null;
        String categoryParam = category != null && !category.isBlank() ? category : null;

        Page<Experience> result = experienceRepository.findActive(
                cityParam, categoryParam,
                PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));

        List<ExperienceResponse> responses = result.getContent().stream()
                .map(e -> {
                    long filled = bookingRepository.countFilledSeats(e);
                    return ExperienceResponse.from(e, filled);
                }).toList();

        return PageResponse.of(responses, result.getTotalElements(), page, limit);
    }

    public ExperienceResponse getById(String id) {
        Experience e = experienceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        long filled = bookingRepository.countFilledSeats(e);
        return ExperienceResponse.from(e, filled);
    }

    public List<ExperienceResponse> getFeatured() {
        return experienceRepository.findByFeaturedTrueAndStatus("active").stream()
                .map(e -> {
                    long filled = bookingRepository.countFilledSeats(e);
                    return ExperienceResponse.from(e, filled);
                }).toList();
    }

    @Transactional
    public ExperienceResponse create(User user, CreateExperienceRequest req) {
        if (!"approved".equals(user.getStatus())) {
            throw ApiException.forbidden("Your account must be approved before hosting experiences");
        }

        Business business = businessRepository.findById(req.businessId())
                .orElseThrow(() -> ApiException.notFound("Business not found"));
        if (!"approved".equals(business.getStatus())) {
            throw ApiException.badRequest("Business is not yet approved");
        }

        List<String> tags = req.tags() != null ? req.tags() : List.of();

        Experience exp = Experience.builder()
                .host(user)
                .business(business)
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .emoji(req.emoji() != null ? req.emoji() : "🌍")
                .city(req.city())
                .country(req.country() != null ? req.country() : "PT")
                .lat(req.lat())
                .lng(req.lng())
                .date(req.date())
                .time(req.time())
                .durationMins(req.durationMins() != null ? req.durationMins() : 120)
                .minSeats(req.minSeats() != null ? req.minSeats() : 4)
                .maxSeats(req.maxSeats() != null ? req.maxSeats() : 8)
                .price(req.price())
                .currency(req.currency() != null ? req.currency() : "EUR")
                .coverImage(req.coverImage())
                .tags(toJsonArray(tags))
                .build();

        return ExperienceResponse.from(experienceRepository.save(exp), 0);
    }

    private String toJsonArray(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }
}

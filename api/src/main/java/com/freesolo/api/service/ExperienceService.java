package com.freesolo.api.service;

import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.experience.CreateExperienceRequest;
import com.freesolo.api.dto.experience.ExperienceResponse;
import com.freesolo.api.dto.experience.MemberResponse;
import com.freesolo.api.dto.hosting.HostedListingResponse;
import com.freesolo.api.entity.Booking;
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
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final BusinessRepository businessRepository;
    private final BookingRepository bookingRepository;
    private final JsonMapper jsonMapper;

    /** Small groups are the product: no listing seats more than this many travelers. */
    static final int MAX_GROUP_SIZE = 12;

    public PageResponse<ExperienceResponse> list(String kind, String city, String category, int page, int limit) {
        String kindParam     = kind     != null && !kind.isBlank()     ? kind     : null;
        String cityParam     = city     != null && !city.isBlank()     ? city     : null;
        String categoryParam = category != null && !category.isBlank() ? category : null;

        Page<Experience> result = experienceRepository.findActive(
                kindParam, cityParam, categoryParam,
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

    /** Travelers holding a seat. Join requests still awaiting the host are not listed. */
    public List<MemberResponse> getMembers(String experienceId) {
        Experience e = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        return bookingRepository.findByExperienceAndStatusInOrderByCreatedAtAsc(
                        e, List.of(Booking.PENDING, Booking.CONFIRMED, Booking.COMPLETED))
                .stream().map(MemberResponse::from).toList();
    }

    public List<HostedListingResponse> getHostedBy(User host) {
        return experienceRepository.findByHostOrderByCreatedAtDesc(host).stream()
                .map(e -> new HostedListingResponse(
                        ExperienceResponse.from(e, bookingRepository.countFilledSeats(e)),
                        bookingRepository.countByExperienceAndStatus(e, Booking.REQUESTED)))
                .toList();
    }

    @Transactional
    public ExperienceResponse create(User user, CreateExperienceRequest req) {
        if (!"approved".equals(user.getStatus())) {
            throw ApiException.forbidden("Your account must be approved before hosting");
        }

        boolean trip = Experience.KIND_TRIP.equals(req.kind());

        Business business = null;
        if (req.businessId() != null && !req.businessId().isBlank()) {
            business = businessRepository.findById(req.businessId())
                    .orElseThrow(() -> ApiException.notFound("Business not found"));
            if (!business.getOwner().getId().equals(user.getId())) {
                throw ApiException.forbidden("You can only host at venues you own");
            }
            if (!"approved".equals(business.getStatus())) {
                throw ApiException.badRequest("Business is not yet approved");
            }
        } else if (!trip) {
            throw ApiException.badRequest("Experiences are hosted at one of your approved venues");
        }

        if (trip && (req.endDate() == null || req.endDate().isBlank())) {
            throw ApiException.badRequest("Trips need an end date");
        }

        int minSeats = req.minSeats() != null ? req.minSeats() : 4;
        int maxSeats = req.maxSeats() != null ? req.maxSeats() : 8;
        if (minSeats > maxSeats) {
            throw ApiException.badRequest("Minimum group size cannot be larger than the maximum");
        }
        if (maxSeats > MAX_GROUP_SIZE) {
            throw ApiException.badRequest("FreeSolo groups cap at " + MAX_GROUP_SIZE + " travelers");
        }

        String joinPolicy = req.joinPolicy() != null
                ? req.joinPolicy()
                : trip ? Experience.JOIN_APPROVAL : Experience.JOIN_INSTANT;

        Experience exp = Experience.builder()
                .kind(trip ? Experience.KIND_TRIP : Experience.KIND_EXPERIENCE)
                .host(user)
                .business(business)
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .emoji(req.emoji() != null ? req.emoji() : trip ? "🧭" : "🌍")
                .city(req.city())
                .country(req.country() != null ? req.country() : "PT")
                .lat(req.lat())
                .lng(req.lng())
                .date(req.date())
                .time(req.time())
                .endDate(trip ? req.endDate() : null)
                .durationMins(req.durationMins() != null ? req.durationMins() : 120)
                .minSeats(minSeats)
                .maxSeats(maxSeats)
                .price(req.price())
                .currency(req.currency() != null ? req.currency() : "EUR")
                .coverImage(req.coverImage())
                .tags(toJson(req.tags()))
                .itinerary(toJson(req.itinerary()))
                .included(toJson(req.included()))
                .joinPolicy(joinPolicy)
                .build();

        return ExperienceResponse.from(experienceRepository.save(exp), 0);
    }

    private String toJson(List<?> list) {
        return list == null || list.isEmpty() ? "[]" : jsonMapper.writeValueAsString(list);
    }
}

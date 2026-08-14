package com.freesolo.api.service;

import com.freesolo.api.dto.business.BusinessResponse;
import com.freesolo.api.dto.business.CreateBusinessRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.entity.Business;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.BusinessRepository;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public PageResponse<BusinessResponse> list(String city, String type, int page, int limit) {
        String cityParam = city != null && !city.isBlank() ? city : null;
        String typeParam = type != null && !type.isBlank() ? type : null;

        Page<Business> result = businessRepository.findApproved(
                cityParam, typeParam,
                PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));

        List<BusinessResponse> responses = result.getContent().stream().map(BusinessResponse::from).toList();
        return PageResponse.of(responses, result.getTotalElements(), page, limit);
    }

    public BusinessResponse getById(String id) {
        return BusinessResponse.from(businessRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Business not found")));
    }

    @Transactional
    public BusinessResponse create(String userId, CreateBusinessRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!"approved".equals(user.getStatus())) {
            throw ApiException.forbidden("Your account must be approved to register a business");
        }

        Business biz = Business.builder()
                .owner(user)
                .name(req.name().trim())
                .type(req.type().trim())
                .address(req.address().trim())
                .city(req.city().trim())
                .country(req.country() != null ? req.country() : "PT")
                .lat(req.lat())
                .lng(req.lng())
                .mapsLink(req.mapsLink())
                .tripadvisor(req.tripadvisor())
                .instagram(req.instagram())
                .website(req.website())
                .description(req.description())
                .coverImage(req.coverImage())
                .build();

        return BusinessResponse.from(businessRepository.save(biz));
    }
}

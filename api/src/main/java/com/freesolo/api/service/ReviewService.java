package com.freesolo.api.service;

import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.review.CreateReviewRequest;
import com.freesolo.api.dto.review.ReviewResponse;
import com.freesolo.api.dto.review.UpdateReviewRequest;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public PageResponse<ReviewResponse> list(String experienceId, String hostId, int page, int limit) {
        String expParam  = experienceId != null && !experienceId.isBlank() ? experienceId : null;
        String hostParam = hostId != null && !hostId.isBlank() ? hostId : null;

        Page<Review> result = reviewRepository.findFiltered(
                expParam, hostParam,
                PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));

        List<ReviewResponse> responses = result.getContent().stream().map(ReviewResponse::from).toList();
        return PageResponse.of(responses, result.getTotalElements(), page, limit);
    }

    public ReviewResponse getById(String id) {
        return ReviewResponse.from(reviewRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Review not found")));
    }

    @Transactional
    public ReviewResponse create(String authorId, CreateReviewRequest req) {
        Booking booking = bookingRepository.findById(req.bookingId())
                .orElseThrow(() -> ApiException.notFound("Booking not found"));

        if (!booking.getUser().getId().equals(authorId)) {
            throw ApiException.forbidden("You can only review your own bookings");
        }
        if (!"completed".equals(booking.getStatus())) {
            throw ApiException.badRequest("You can only review completed bookings");
        }
        if (reviewRepository.existsByBooking(booking)) {
            throw ApiException.conflict("You have already reviewed this booking");
        }

        User author = userRepository.findById(authorId).orElseThrow();
        Experience exp = booking.getExperience();

        Review review = Review.builder()
                .author(author)
                .target(exp.getHost())
                .experience(exp)
                .booking(booking)
                .rating(req.rating())
                .body(req.body())
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse update(String reviewId, String userId, UpdateReviewRequest req) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Review not found"));

        boolean isAuthor = review.getAuthor().getId().equals(userId);
        boolean isHost   = review.getExperience() != null &&
                           review.getExperience().getHost().getId().equals(userId);

        if (!isAuthor && !isHost) throw ApiException.forbidden("Access denied");

        if (isAuthor) {
            review.setRating(req.rating());
            if (req.body() != null) review.setBody(req.body());
        }
        if (isHost && req.reply() != null) {
            review.setReply(req.reply().isBlank() ? null : req.reply());
        }

        return ReviewResponse.from(reviewRepository.save(review));
    }
}

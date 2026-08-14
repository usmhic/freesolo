package com.freesolo.api.service;

import com.freesolo.api.dto.user.UpdateUserRequest;
import com.freesolo.api.dto.user.UserResponse;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.ExperienceRepository;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public UserResponse getPublicProfile(String id) {
        User user = getById(id);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateUserRequest req) {
        User user = getById(userId);
        if (req.name() != null) user.setName(req.name().trim());
        if (req.phone() != null) user.setPhone(req.phone().trim().isEmpty() ? null : req.phone().trim());
        if (req.bio() != null) user.setBio(req.bio().trim().isEmpty() ? null : req.bio().trim());
        if (req.image() != null) user.setImage(req.image().trim().isEmpty() ? null : req.image().trim());
        if (req.marketingOptIn() != null) user.setMarketingOptIn(req.marketingOptIn());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void registerPushToken(String userId, String token) {
        User user = getById(userId);
        user.setPushToken(token);
        userRepository.save(user);
    }
}

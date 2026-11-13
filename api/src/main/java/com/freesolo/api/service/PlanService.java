package com.freesolo.api.service;

import com.freesolo.api.dto.planning.PlanResponse;
import com.freesolo.api.dto.planning.PlanStop;
import com.freesolo.api.dto.planning.SavePlanRequest;
import com.freesolo.api.dto.routing.RouteResult;
import com.freesolo.api.entity.JourneyPlan;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.JourneyPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Members' saved journeys. The API computes each plan's route itself on save
 * (through {@link RoutingService}), so what is stored always matches the stops.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlanService {

    static final int MAX_PLANS_PER_MEMBER = 100;

    private final JourneyPlanRepository planRepository;
    private final RoutingService routingService;
    private final JsonMapper jsonMapper;

    public List<PlanResponse> list(String ownerId) {
        return planRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId).stream().map(this::toResponse).toList();
    }

    public PlanResponse get(String ownerId, String planId) {
        return toResponse(owned(ownerId, planId));
    }

    @Transactional
    public PlanResponse create(User owner, SavePlanRequest req) {
        if (planRepository.countByOwnerId(owner.getId()) >= MAX_PLANS_PER_MEMBER) {
            throw ApiException.badRequest("You've reached " + MAX_PLANS_PER_MEMBER + " saved plans — delete one to save another");
        }
        JourneyPlan plan = JourneyPlan.builder().owner(owner).build();
        apply(plan, req);
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public PlanResponse update(String ownerId, String planId, SavePlanRequest req) {
        JourneyPlan plan = owned(ownerId, planId);
        apply(plan, req);
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void delete(String ownerId, String planId) {
        planRepository.delete(owned(ownerId, planId));
    }

    /**
     * The JSON a hosted trip stores as its route: the plan's stops and the
     * computed line, without the plan's private notes.
     */
    public String toTripRoute(String ownerId, String planId) {
        PlanResponse plan = get(ownerId, planId);
        if (plan.route() == null || plan.stops().size() < 2) {
            throw ApiException.badRequest("This plan needs at least two stops and a route before it can go on a trip");
        }
        Map<String, Object> route = new LinkedHashMap<>();
        route.put("profile", plan.profile());
        route.put("stops", plan.stops().stream()
                .map(s -> new PlanStop(s.name(), s.lat(), s.lng(), s.day(), null)).toList());
        route.put("coordinates", plan.route().coordinates());
        route.put("legs", plan.route().legs());
        route.put("distanceMeters", plan.route().distanceMeters());
        route.put("durationSeconds", plan.route().durationSeconds());
        route.put("estimated", plan.route().estimated());
        return jsonMapper.writeValueAsString(route);
    }

    private void apply(JourneyPlan plan, SavePlanRequest req) {
        if (!RoutingService.PROFILES.containsKey(req.profile())) {
            throw ApiException.badRequest("Unknown travel mode");
        }
        plan.setTitle(req.title().trim());
        plan.setProfile(req.profile());
        plan.setStartDate(req.startDate() != null && !req.startDate().isBlank() ? req.startDate().trim() : null);
        plan.setStops(jsonMapper.writeValueAsString(req.stops()));

        RouteResult route = null;
        if (req.stops().size() >= 2) {
            try {
                route = routingService.route(req.profile(),
                        req.stops().stream().map(s -> new double[]{s.lng(), s.lat()}).toList());
            } catch (ApiException e) {
                // Keep the member's edits even when routing fails; the planner shows why.
                if (e.getStatus() == HttpStatus.BAD_REQUEST) throw e;
                log.info("Saved plan without a route: {}", e.getMessage());
            }
        }
        plan.setRoute(route != null ? jsonMapper.writeValueAsString(route) : null);
        plan.setDistanceMeters(route != null ? route.distanceMeters() : 0);
        plan.setDurationSeconds(route != null ? route.durationSeconds() : 0);
    }

    private JourneyPlan owned(String ownerId, String planId) {
        JourneyPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> ApiException.notFound("Plan not found"));
        // Someone else's plan looks the same as a missing one.
        if (!plan.getOwner().getId().equals(ownerId)) throw ApiException.notFound("Plan not found");
        return plan;
    }

    private PlanResponse toResponse(JourneyPlan p) {
        List<PlanStop> stops = jsonMapper.readValue(p.getStops(), new TypeReference<>() {});
        RouteResult route = p.getRoute() != null ? jsonMapper.readValue(p.getRoute(), RouteResult.class) : null;
        return new PlanResponse(p.getId(), p.getTitle(), p.getProfile(), p.getStartDate(), stops, route,
                p.getDistanceMeters(), p.getDurationSeconds(), p.getCreatedAt(), p.getUpdatedAt());
    }
}

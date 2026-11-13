package com.freesolo.api.service;

import com.freesolo.api.dto.planning.PlanStop;
import com.freesolo.api.dto.planning.SavePlanRequest;
import com.freesolo.api.dto.routing.RouteResult;
import com.freesolo.api.entity.JourneyPlan;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.JourneyPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanServiceTest {

    @Mock JourneyPlanRepository planRepository;
    @Mock RoutingService routingService;

    PlanService planService;
    final JsonMapper json = JsonMapper.builder().build();
    final User ana = User.builder().id("ana").build();

    static final List<PlanStop> STOPS = List.of(
            new PlanStop("Lisbon", 38.72, -9.14, 1, "pick up the van"),
            new PlanStop("Sintra", 38.80, -9.38, 2, null));
    static final RouteResult ROUTE = new RouteResult("driving-car", 30_000, 2_000,
            List.of(new double[]{-9.14, 38.72}, new double[]{-9.38, 38.80}),
            List.of(new RouteResult.Leg(30_000, 2_000)), false);

    @BeforeEach
    void setUp() {
        planService = new PlanService(planRepository, routingService, json);
        lenient().when(planRepository.save(any(JourneyPlan.class))).thenAnswer(inv -> {
            JourneyPlan p = inv.getArgument(0);
            if (p.getId() == null) p.setId("plan-1");
            return p;
        });
    }

    @Test
    void savingComputesTheRouteFromTheStops() {
        when(routingService.route(eq("driving-car"), anyList())).thenReturn(ROUTE);

        var plan = planService.create(ana, new SavePlanRequest("  Coast week ", "driving-car", null, STOPS));

        assertThat(plan.title()).isEqualTo("Coast week");
        assertThat(plan.route().distanceMeters()).isEqualTo(30_000);
        assertThat(plan.distanceMeters()).isEqualTo(30_000);
        assertThat(plan.stops()).hasSize(2);
        verify(routingService).route(eq("driving-car"), argThat(c -> c.get(0)[0] == -9.14 && c.get(0)[1] == 38.72));
    }

    @Test
    void aRoutingFailureStillKeepsTheMembersEdits() {
        when(routingService.route(anyString(), anyList())).thenThrow(ApiException.unprocessable("unreachable"));

        var plan = planService.create(ana, new SavePlanRequest("Coast", "driving-car", null, STOPS));

        assertThat(plan.route()).isNull();
        assertThat(plan.stops()).hasSize(2);
    }

    @Test
    void anotherMembersPlanLooksMissing() {
        JourneyPlan bens = JourneyPlan.builder().id("p").owner(User.builder().id("ben").build())
                .title("x").profile("driving-car").stops("[]").build();
        when(planRepository.findById("p")).thenReturn(Optional.of(bens));

        assertThatThrownBy(() -> planService.get("ana", "p"))
                .isInstanceOf(ApiException.class).hasMessage("Plan not found");
        assertThatThrownBy(() -> planService.delete("ana", "p")).isInstanceOf(ApiException.class);
        verify(planRepository, never()).delete(any());
    }

    @Test
    void aTripRouteCarriesTheLineButNotThePrivateNotes() {
        JourneyPlan plan = JourneyPlan.builder().id("p").owner(ana).title("Coast").profile("driving-car")
                .stops(json.writeValueAsString(STOPS)).route(json.writeValueAsString(ROUTE)).build();
        when(planRepository.findById("p")).thenReturn(Optional.of(plan));

        String route = planService.toTripRoute("ana", "p");

        assertThat(route).contains("\"Lisbon\"").contains("\"coordinates\"").contains("\"distanceMeters\":30000");
        assertThat(route).doesNotContain("pick up the van");
    }

    @Test
    void unknownModesAreRejected() {
        assertThatThrownBy(() -> planService.create(ana, new SavePlanRequest("x", "rocket", null, STOPS)))
                .hasMessageContaining("travel mode");
        verify(planRepository, never()).save(any());
    }
}

package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.Rank;

import java.util.List;

/**
 * A player's rank, earned with stardust from solved lessons in any city.
 * Ranks are never sold: they only mean something if they're earned.
 */
public final class StarRanks {

    /** Each hint costs a fifth of a mission's points, down to half of them. */
    static final double HINT_COST = 0.2;

    record Step(String key, String name, int min) {}

    static final List<Step> LADDER = List.of(
            new Step("nebula", "Nebula", 0),
            new Step("protostar", "Protostar", 100),
            new Step("white-dwarf", "White Dwarf", 400),
            new Step("red-giant", "Red Giant", 1000),
            new Step("blue-giant", "Blue Giant", 2000),
            new Step("supernova", "Supernova", 4000),
            new Step("black-hole", "Black Hole", 8000));

    private StarRanks() {
    }

    /** Stardust for solving a mission worth {@code points}, rounded to 5. */
    public static int stardustFor(int points, int hintsUsed) {
        double share = Math.max(0.5, 1 - HINT_COST * Math.max(0, hintsUsed));
        return (int) Math.round(points * share / 5.0) * 5;
    }

    public static Rank rankFor(int stardust) {
        for (int i = LADDER.size() - 1; i >= 0; i--) {
            Step s = LADDER.get(i);
            if (stardust >= s.min()) {
                Step next = i + 1 < LADDER.size() ? LADDER.get(i + 1) : null;
                return new Rank(s.key(), s.name(), s.min(), next == null ? null : next.min(), next == null ? null : next.name());
            }
        }
        throw new IllegalStateException("The ladder starts at zero");
    }

    public static List<Rank> all() {
        return LADDER.stream().map(s -> rankFor(s.min())).toList();
    }
}

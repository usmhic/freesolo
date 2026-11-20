"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/client-api";
import {
  guestStardust, rankFor, readGuest, serverGuest, subscribeGuest,
  type PlayerView, type Rank,
} from "@/lib/play";

/**
 * The player's stardust, rank and solved lessons: from the API when signed
 * in, from this browser when not.
 */
export function usePlayer(signedIn: boolean) {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [server, setServer] = useState<PlayerView | null>(null);
  const [version, setVersion] = useState(0);
  const guest = useSyncExternalStore(subscribeGuest, readGuest, serverGuest);

  useEffect(() => {
    let live = true;
    api<Rank[]>("/api/play/ranks").then((r) => live && setRanks(r)).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    api<PlayerView>("/api/play/me").then((p) => live && setServer(p)).catch(() => {});
    return () => { live = false; };
  }, [signedIn, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return useMemo(() => {
    if (signedIn) {
      return {
        ready: server != null,
        stardust: server?.stardust ?? 0,
        rank: server?.rank ?? null,
        solved: new Set(server?.solvedLessonIds ?? []),
        unlockedCityIds: new Set(server?.unlockedCityIds ?? []),
        ranks,
        refresh,
        setServer,
      };
    }
    const stardust = guestStardust(guest);
    return {
      ready: true,
      stardust,
      rank: rankFor(stardust, ranks),
      solved: new Set(Object.keys(guest.solved)),
      unlockedCityIds: new Set<string>(),
      ranks,
      refresh,
      setServer,
    };
  }, [signedIn, server, guest, ranks, refresh]);
}

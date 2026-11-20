"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Camera, Check, Lightbulb, Loader2, Lock, MapPin, Sparkles, Trophy, X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { api, ClientApiError } from "@/lib/client-api";
import { RouteMap } from "@/components/map/route-map";
import { rankFor, recordGuestSolve, type AttemptResult, type CityView, type LessonView, type Rank } from "@/lib/play";
import { StarOrb } from "./star-badge";
import { PlacePhoto } from "./place-photo";
import { StoryCard } from "./story-card";
import { usePlayer } from "./use-player";

/** Shrinks a phone photo to at most 1280px before it's sent for checking. */
async function toDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function LessonScreen({ lessonId, signedIn }: { lessonId: string; signedIn: boolean }) {
  const player = usePlayer(signedIn);
  const [lesson, setLesson] = useState<LessonView | null>(null);
  const [city, setCity] = useState<CityView | null>(null);
  const [lockedCity, setLockedCity] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [rankUp, setRankUp] = useState<Rank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    api<LessonView>(`/api/play/lessons/${lessonId}`)
      .then(async (l) => {
        if (!live) return;
        setLesson(l);
        const c = await api<CityView>(`/api/play/cities/${l.cityId}`).catch(() => null);
        if (live) setCity(c);
      })
      .catch((e) => {
        if (!live) return;
        if (e instanceof ClientApiError && e.status === 403) setLockedCity(e.message);
        else setLoadError(e instanceof Error ? e.message : "Couldn't load this level");
      });
    return () => { live = false; };
  }, [lessonId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lesson || (!answer.trim() && !photo)) return;
    setChecking(true);
    setError(null);
    const before = player.rank;
    try {
      const r = await api<AttemptResult>(`/api/play/lessons/${lessonId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ answer: answer.trim() || null, photo, hintsUsed: hints }),
      });
      setResult(r);
      if (!r.correct) {
        setShake((n) => n + 1);
        return;
      }
      let after: Rank | null = null;
      if (r.player) {
        player.setServer(r.player);
        after = r.player.rank;
      } else if (r.stardustEarned > 0) {
        recordGuestSolve(lessonId, lesson.cityId, r.stardustEarned);
        after = rankFor(player.stardust + r.stardustEarned, player.ranks);
      }
      if (before && after && after.key !== before.key) setRankUp(after);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't check your answer");
    } finally {
      setChecking(false);
    }
  }

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await toDataUrl(file));
    } catch {
      setError("That photo couldn't be read — try another one");
    }
  }

  if (lockedCity) {
    return (
      <Shell>
        <div className="card mx-auto max-w-lg p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-navy text-white dark:bg-sunset"><Lock className="size-6" /></span>
          <h1 className="mt-5 font-display text-2xl font-extrabold">This level is in the city pack</h1>
          <p className="mt-2 text-ink-soft">{lockedCity}. Packs are free while we&apos;re in pilot.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/play" className="btn-primary">Back to the cities</Link>
            {!signedIn && <Link href={`/sign-in?next=${encodeURIComponent("/play")}`} className="btn-outline">Sign in</Link>}
          </div>
        </div>
      </Shell>
    );
  }
  if (loadError) {
    return <Shell><p className="text-center text-ink-soft">{loadError}</p></Shell>;
  }
  if (!lesson) {
    return <Shell><div className="flex justify-center py-20 text-ink-soft"><Loader2 className="size-6 animate-spin" /></div></Shell>;
  }

  const l = lesson.card;
  const solvedBefore = l.solved || player.solved.has(l.id);
  const order = city?.lessons ?? [];
  const idx = order.findIndex((x) => x.id === l.id);
  const nextLesson = idx >= 0 ? order.slice(idx + 1).concat(order.slice(0, idx)).find((x) => !x.locked && !x.solved && !player.solved.has(x.id) && x.id !== l.id) : undefined;
  const won = result?.correct;
  const lockedLeft = order.filter((x) => x.locked).length;
  const solvedAfter = order.filter((x) => x.solved || player.solved.has(x.id) || (won && x.id === l.id)).length;
  const cityComplete = order.length > 0 && solvedAfter === order.length;

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3">
        <Link href={`/play/${lesson.cityId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" /> {lesson.cityName} journey
        </Link>
        {idx >= 0 && (
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            Level {idx + 1} of {order.length}
            <span className="hidden gap-1 sm:flex" aria-hidden>
              {order.map((x) => (
                <span key={x.id} className={cn("size-1.5 rounded-full", x.id === l.id ? "w-4 bg-sunset" : (x.solved || player.solved.has(x.id)) ? "bg-sunset/50" : "bg-line")} />
              ))}
            </span>
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0 space-y-5">
          <div className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-3xl">
            <PlacePhoto photo={l.photo} width={1280} alt={l.place} credit colors={["#233846", "#16242F"]} className="aspect-[4/3] sm:aspect-[16/9]" priority veiled={!won && !solvedBefore} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            {l.photo && !won && !solvedBefore && (
              <span className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">🔒 Solve to reveal</span>
            )}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-sunset px-2.5 py-1 text-white">{l.era}</span>
              <span className="rounded-full bg-black/40 px-2.5 py-1 text-white backdrop-blur">✨ {l.points}</span>
              <span className="rounded-full bg-black/40 px-2.5 py-1 text-white backdrop-blur">{l.minutes} min</span>
              {solvedBefore && !won && <span className="rounded-full bg-sage px-2.5 py-1 text-white">Solved ✓</span>}
            </div>
            <div className="absolute inset-x-4 bottom-7 text-white sm:inset-x-6">
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight drop-shadow sm:text-4xl">{l.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-white/90"><MapPin className="size-4 text-sunset" /> {l.place}</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-ink">{l.hook}</p>

          {!won ? (
            <form onSubmit={submit} className="card space-y-4 p-5 sm:p-6">
              <p className="eyebrow">Your challenge</p>
              <p className="font-display text-xl font-bold leading-snug">{lesson.challenge}</p>

              <div key={shake} className={cn(shake > 0 && "animate-[shake_0.35s_ease-in-out]")}>
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                  placeholder="Type what you found…"
                  aria-label="Your answer"
                  className="field h-12 text-base"
                />
              </div>

              {lesson.aiJudge && (
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
                  {photo ? (
                    <span className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Your photo" className="size-16 rounded-xl object-cover" />
                      <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo" className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-ink text-paper">
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline btn-sm">
                      <Camera className="size-4" /> Add a photo
                    </button>
                  )}
                  <span className="text-xs text-ink-soft">A photo of what you found counts too.</span>
                </div>
              )}

              {result && !result.correct && (
                <p role="status" className="rounded-xl bg-sunset-soft px-4 py-3 text-sm text-ink">{result.feedback}</p>
              )}
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button type="submit" disabled={checking || (!answer.trim() && !photo)} className="btn-primary w-full py-3 text-[15px]">
                {checking ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {checking ? "Checking…" : "Check my answer"}
              </button>

              {lesson.hints.length > 0 && (
                <div className="space-y-2 border-t border-line pt-4">
                  {lesson.hints.slice(0, hints).map((h, i) => (
                    <p key={i} className="flex gap-2 text-sm text-ink"><Lightbulb className="mt-0.5 size-4 shrink-0 text-sunset" /> {h}</p>
                  ))}
                  {hints < lesson.hints.length && (
                    <button type="button" onClick={() => setHints((n) => n + 1)} className="btn-ghost btn-sm -ml-2 text-ink-soft">
                      <Lightbulb className="size-4" /> {hints === 0 ? "Need a hint?" : "Another hint"} <span className="text-xs">(−{Math.round(l.points * 0.2)} ✨)</span>
                    </button>
                  )}
                </div>
              )}
            </form>
          ) : (
            <div className="card overflow-hidden">
              <div className="relative bg-navy p-6 text-white dark:bg-navy-deep">
                <div className="flex items-center gap-4">
                  <span className="flex size-14 items-center justify-center rounded-full bg-sunset text-white shadow-lg shadow-sunset/40">
                    <Check className="size-7" />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold">{result!.feedback}</p>
                    <p className="text-white/80">
                      {result!.stardustEarned > 0
                        ? `+${result!.stardustEarned} stardust · you lit a star over ${lesson.cityName}`
                        : "Already in your sky — great to revisit."}
                      {result!.judgedBy === "ai" && " · checked by AI"}
                    </p>
                  </div>
                </div>
                {rankUp && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                    <StarOrb rankKey={rankUp.key} size={40} />
                    <p className="text-sm"><span className="font-bold">You&apos;re now a {rankUp.name}!</span> Your star just evolved.</p>
                  </div>
                )}
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="eyebrow flex items-center gap-1.5"><BookOpen className="size-3.5" /> What happened here</p>
                <StoryCard facts={result!.facts ?? []} story={result!.story ?? ""} sources={result!.sources ?? []} place={l.place} city={lesson.cityName} />
                {cityComplete ? (
                  <div className="rounded-2xl bg-sunset-soft p-4 text-sm text-ink">
                    <p className="font-display text-lg font-bold">🏆 You&apos;ve solved all of {lesson.cityName}!</p>
                    <p className="mt-1 text-ink-soft">Its constellation is complete. Ready for another city?</p>
                  </div>
                ) : !nextLesson && lockedLeft > 0 ? (
                  <div className="rounded-2xl border border-sunset/40 bg-sunset-soft p-4 text-sm">
                    <p className="font-display text-lg font-bold text-ink">That&apos;s every free level in {lesson.cityName}.</p>
                    <p className="mt-1 text-ink-soft">{lockedLeft} more levels are waiting in the city pack — free during the pilot.</p>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  {nextLesson ? (
                    <Link href={`/play/lessons/${nextLesson.id}`} className="btn-primary flex-1">Next level <ArrowRight className="size-4" /></Link>
                  ) : cityComplete ? (
                    <Link href="/play" className="btn-primary flex-1">Pick another city <ArrowRight className="size-4" /></Link>
                  ) : lockedLeft > 0 ? (
                    <Link href={`/play/${lesson.cityId}`} className="btn-primary flex-1"><Lock className="size-4" /> Unlock the city pack</Link>
                  ) : (
                    <Link href={`/play/${lesson.cityId}`} className="btn-primary flex-1">Back to {lesson.cityName}</Link>
                  )}
                  <Link href="/sky" className="btn-outline flex-1"><Sparkles className="size-4" /> See my sky</Link>
                </div>
                {signedIn && result!.stardustEarned > 0 && (
                  <Link href="/ranking" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-sunset">
                    <Trophy className="size-4" /> See where you rank
                  </Link>
                )}
                {!signedIn && result!.stardustEarned > 0 && (
                  <p className="text-xs text-ink-soft">Your stars are saved in this browser. <Link href="/sign-in" className="font-semibold text-sunset">Sign in</Link> to keep them everywhere.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="isolate h-[200px] overflow-hidden rounded-3xl border border-line lg:h-[340px]">
            <RouteMap stops={[{ name: l.place, lat: l.lat, lng: l.lng }]} fitMaxZoom={16} className="h-full w-full" />
          </div>
          <a
            href={`https://www.openstreetmap.org/directions?to=${l.lat}%2C${l.lng}#map=17/${l.lat}/${l.lng}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline w-full"
          >
            <MapPin className="size-4" /> Walk me there
          </a>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container-page py-8 sm:py-10">{children}</div>;
}

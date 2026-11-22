"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, Pause, PlayCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { LOCALES } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { videoSearch, type Fact, type Source } from "@/lib/play";

/** The reward: key facts as big chips, a short story you can read or listen to, and videos. */
export function StoryCard({
  facts, story, sources, place, city,
}: { facts: Fact[]; story: string; sources: Source[]; place: string; city: string }) {
  const { t, lang, fill } = useI18n();
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const sentences = story.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [story];
  const short = sentences.slice(0, 2).join("").trim();
  const more = sentences.length > 2;

  useEffect(() => {
    const id = setTimeout(() => setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window), 0);
    return () => { clearTimeout(id); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  function listen() {
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(story);
    u.lang = LOCALES[lang];
    u.rate = 0.98;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="space-y-5">
      {facts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {facts.map((f) => (
            <div key={f.value + f.label} className="rounded-2xl bg-paper p-3 text-center ring-1 ring-line">
              <p className="font-display text-lg font-extrabold leading-tight text-sunset [overflow-wrap:anywhere] sm:text-xl">{f.value}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-soft">{f.label}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="leading-relaxed text-ink">{open || !more ? story : short}</p>
        {more && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sunset">
            {open ? t.story.showLess : t.story.readMore} <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {canSpeak && (
          <button type="button" onClick={listen} className={cn("btn-outline btn-sm", speaking && "border-sunset text-sunset")}>
            {speaking ? <Pause className="size-4" /> : <Volume2 className="size-4" />} {speaking ? t.story.stop : t.story.listen}
          </button>
        )}
        <a href={videoSearch(place, city, t.story.videoWord)} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
          <PlayCircle className="size-4 text-red-600" /> {t.story.watch}
        </a>
        <details className="group w-full text-sm sm:w-auto">
          <summary className="btn-ghost btn-sm cursor-pointer list-none text-ink-soft [&::-webkit-details-marker]:hidden">
            {fill(t.story.sources, { n: sources.length })}
          </summary>
          <ul className="mt-2 space-y-1 ps-3">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink-soft hover:text-sunset">
                  <ExternalLink className="size-3.5" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

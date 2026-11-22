import { Check, Lightbulb, MapPin, Sparkles } from "lucide-react";
import { StarOrb } from "@/components/play/star-badge";
import type { Dict } from "@/lib/i18n/dictionaries/en";

/** A static preview of a mission for the landing page (markup, not a screenshot). */
export function LessonPreview({ t }: { t: Dict["home"] }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sunset/20 via-transparent to-sky/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs">
          <span className="font-semibold text-ink-soft">{t.previewCity}</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink"><StarOrb rankKey="protostar" size={18} /> ✨ 250</span>
        </div>
        <div className="relative h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/play/photos/porto-luis-bridge.webp" alt={t.previewPlace} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute start-4 top-3 flex gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-sunset px-2.5 py-1 text-white">1886</span>
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-white backdrop-blur">✨ 100</span>
          </div>
          <div className="absolute inset-x-4 bottom-3 text-white">
            <p className="font-display text-xl font-extrabold leading-tight drop-shadow">{t.previewTitle}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-white/90"><MapPin className="size-3.5 text-sunset" /> {t.previewPlace}</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-paper p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sunset">{t.yourChallenge}</p>
            <p className="mt-1.5 font-semibold">{t.previewChallenge}</p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
              <span>{t.previewAnswer}</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-sage text-white"><Check className="size-3.5" /></span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft"><Lightbulb className="size-3.5" /> {t.previewChecked}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-navy p-4 text-white">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sunset"><Sparkles className="size-5" /></span>
            <div className="text-sm">
              <p className="font-bold">{t.previewWin}</p>
              <p className="text-white/75">{t.previewUnlock}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

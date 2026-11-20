import { Check, Lightbulb, MapPin, Sparkles } from "lucide-react";
import { StarOrb } from "@/components/play/star-badge";

/** A static preview of a level for the landing page (markup, not a screenshot). */
export function LessonPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sunset/20 via-transparent to-sky/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs">
          <span className="font-semibold text-ink-soft">🍷 Porto · Level 3 of 7</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink"><StarOrb rankKey="protostar" size={18} /> Protostar · ✨ 250</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-sunset-soft px-2.5 py-1 text-sunset">1886</span>
            <span className="rounded-full bg-fd-muted px-2.5 py-1 text-ink-soft">10 min</span>
          </div>
          <div>
            <p className="font-display text-xl font-extrabold leading-tight">The bridge from Eiffel&apos;s workshop</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft"><MapPin className="size-3.5 text-sunset" /> Dom Luís I Bridge</p>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sunset">Your challenge</p>
            <p className="mt-1.5 font-semibold">Count them: how many decks does the bridge have?</p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
              <span>one up top, one by the water</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-sage text-white"><Check className="size-3.5" /></span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft"><Lightbulb className="size-3.5" /> Checked by AI — your own words are fine</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-navy p-4 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-sunset"><Sparkles className="size-5" /></span>
            <div className="text-sm">
              <p className="font-bold">+150 stardust · a new star over Porto</p>
              <p className="text-white/75">Unlocked: the story of Seyrig, Eiffel&apos;s partner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

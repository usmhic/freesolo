import { Bike, Car, Footprints, GripVertical, MapPin, Mountain, Search } from "lucide-react";

/** A static preview of the planner UI for the landing page (markup, not a screenshot). */
const DAYS = [
  { day: 1, stops: [["Porto", "Start"], ["Peso da Régua", "1 h 15 min · 98 km"]] },
  { day: 2, stops: [["Pinhão", "35 min · 26 km"], ["Vila Real", "40 min · 31 km"]] },
];

export function PlannerPreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0E1A24] shadow-2xl">
      <div className="grid sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/60">
            <Search className="size-4" /> Add a place…
          </div>
          <div className="flex gap-1.5">
            {[Car, Bike, Mountain, Footprints].map((Icon, i) => (
              <span
                key={i}
                className={`flex h-9 flex-1 items-center justify-center rounded-lg ${i === 0 ? "bg-sunset text-white" : "bg-white/5 text-white/60"}`}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
          {DAYS.map((d) => (
            <div key={d.day}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sunset">Day {d.day}</p>
              <ul className="mt-2 space-y-1.5">
                {d.stops.map(([name, meta]) => (
                  <li key={name} className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2">
                    <GripVertical className="size-4 text-white/30" />
                    <MapPin className="size-4 text-sunset" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{name}</span>
                      <span className="block text-[11px] text-white/50">{meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm">
            <span className="text-white/60">Total</span>
            <span className="font-semibold text-white">155 km · 2 h 30 min</span>
          </div>
        </div>
        <div className="relative hidden min-h-[320px] sm:block">
          <svg viewBox="0 0 300 380" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <rect width="300" height="380" fill="#132433" />
            <path d="M0 120 C 60 140, 90 90, 150 110 S 260 160, 300 140" fill="none" stroke="#1E3546" strokeWidth="18" />
            <path d="M40 330 C 90 260, 120 270, 150 210 S 230 150, 250 90" fill="none" stroke="#0E1720" strokeWidth="9" strokeLinecap="round" />
            <path d="M40 330 C 90 260, 120 270, 150 210 S 230 150, 250 90" fill="none" stroke="#FF6D1D" strokeWidth="4" strokeLinecap="round" />
            {[[40, 330], [118, 262], [170, 196], [250, 90]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="11" fill="#233846" stroke="#fff" strokeWidth="2.5" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{i + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

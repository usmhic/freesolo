import { CalendarDays, Car, Users } from "lucide-react";

/**
 * Hero illustration: a stylised map with a sample route and the cards a
 * traveler sees. Drawn in SVG/HTML (not a screenshot) so it stays sharp,
 * follows the theme and never shows a screen the product doesn't have.
 */
const STOPS = [
  { x: 70, y: 300, label: "Ponta Delgada" },
  { x: 175, y: 205, label: "Sete Cidades" },
  { x: 300, y: 250, label: "Lagoa do Fogo" },
  { x: 410, y: 140, label: "Furnas" },
];

export function HeroRoute() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl shadow-navy/10">
        <svg viewBox="0 0 480 400" className="block h-auto w-full" role="img" aria-label="A four-stop route across an island">
          <defs>
            <pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-line" />
            </pattern>
          </defs>
          <rect width="480" height="400" className="fill-[#E8EFF3] dark:fill-[#0F1C27]" />
          <rect width="480" height="400" fill="url(#hero-grid)" opacity="0.6" />
          <path
            d="M20 330 C 40 250, 90 190, 150 170 C 210 150, 250 190, 300 180 C 360 170, 380 100, 440 95 C 470 95, 470 160, 455 200 C 430 270, 360 300, 290 320 C 200 345, 110 370, 20 330 Z"
            className="fill-[#F4F1EA] stroke-[#D9D2C4] dark:fill-[#1B2A37] dark:stroke-[#2A3B4A]"
            strokeWidth="2"
          />
          <path d="M150 230 C 200 215, 230 260, 290 250" fill="none" className="stroke-[#CFE0D2] dark:stroke-[#28433A]" strokeWidth="14" strokeLinecap="round" />
          {/* route casing + line */}
          <path
            d={`M${STOPS.map((s) => `${s.x} ${s.y}`).join(" L")}`}
            fill="none"
            stroke="#fff"
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="dark:stroke-[#0E1720]"
          />
          <path
            d={`M${STOPS.map((s) => `${s.x} ${s.y}`).join(" L")}`}
            fill="none"
            stroke="#FF6D1D"
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {STOPS.map((s, i) => (
            <g key={s.label}>
              <circle cx={s.x} cy={s.y} r="13" fill="#233846" stroke="#fff" strokeWidth="3" />
              <text x={s.x} y={s.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
                {i + 1}
              </text>
              <text
                x={s.x + (i === 3 ? -18 : 18)}
                y={s.y - 16}
                textAnchor={i === 3 ? "end" : "start"}
                fontSize="12"
                fontWeight="600"
                className="fill-[#233846] dark:fill-[#E3E9EE]"
              >
                {s.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute left-4 top-4 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sunset">Group trip · 5 days</p>
          <p className="mt-0.5 font-display text-base font-bold text-ink">Azores island hop</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
            <CalendarDays className="size-3.5" /> 10 – 14 Nov
          </p>
        </div>
      </div>

      <div className="absolute -bottom-6 right-4 flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3 shadow-xl sm:right-8">
        <div className="flex -space-x-2">
          {["#233846", "#FF6D1D", "#3F7A5A", "#2F6F8F"].map((c, i) => (
            <span
              key={c}
              className="inline-flex size-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-surface"
              style={{ background: c }}
            >
              {"AMJT"[i]}
            </span>
          ))}
        </div>
        <div className="text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            <Users className="size-3.5" /> 4 of 8 going
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
            <Car className="size-3.5" /> 142 km · 3 h 10 min
          </p>
        </div>
      </div>
    </div>
  );
}

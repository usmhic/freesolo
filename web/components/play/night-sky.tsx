import type { CityView } from "@/lib/play";

/**
 * A player's night sky. Each city is a constellation drawn from the real
 * positions of its lessons, so its shape is the shape of the walk. Solved
 * lessons shine; the rest wait as faint points. A city with every lesson
 * solved gets its lines and name in full.
 */
export function NightSky({ cities, solved, label, className }: { cities: CityView[]; solved: Set<string>; label: string; className?: string }) {
  const W = 800;
  const H = 440;
  const cols = Math.max(1, Math.min(3, cities.length));
  const rows = Math.max(1, Math.ceil(cities.length / cols));
  const cellW = W / cols;
  const cellH = H / rows;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={label}>
      <defs>
        <radialGradient id="sky-bg" cx="50%" cy="0%" r="110%">
          <stop offset="0%" stopColor="#1C3040" />
          <stop offset="100%" stopColor="#0A121A" />
        </radialGradient>
        <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} rx="28" fill="url(#sky-bg)" />
      {BACKGROUND.map(([x, y, r, o], i) => (
        <circle key={i} cx={x * W} cy={y * H} r={r} fill="#fff" opacity={o} />
      ))}

      {cities.map((c, ci) => {
        const col = ci % cols;
        const row = Math.floor(ci / cols);
        const pts = project(c, col * cellW, row * cellH, cellW, cellH);
        const lit = c.lessons.filter((l) => solved.has(l.id));
        const complete = lit.length === c.lessons.length && c.lessons.length > 0;
        const litPts = pts.filter((p) => solved.has(p.id));
        return (
          <g key={c.city.id}>
            {litPts.length > 1 && (
              <polyline
                points={litPts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={complete ? "#FF6D1D" : "#ffffff"}
                strokeOpacity={complete ? 0.8 : 0.35}
                strokeWidth={complete ? 2 : 1.2}
                strokeDasharray={complete ? undefined : "3 5"}
              />
            )}
            {pts.map((p) =>
              solved.has(p.id) ? (
                <g key={p.id} filter="url(#star-glow)">
                  <circle cx={p.x} cy={p.y} r={6} fill="#FFE2B8" />
                  <circle cx={p.x} cy={p.y} r={2.5} fill="#fff" />
                </g>
              ) : (
                <circle key={p.id} cx={p.x} cy={p.y} r={2.5} fill="#fff" opacity={0.22} />
              )
            )}
            <text
              x={col * cellW + cellW / 2}
              y={row * cellH + cellH - 22}
              textAnchor="middle"
              fill="#fff"
              opacity={lit.length ? 0.9 : 0.4}
              fontSize="15"
              fontWeight={complete ? 800 : 600}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {c.city.emoji} {c.city.name} · {lit.length}/{c.lessons.length}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Lessons placed by real latitude/longitude inside a city's cell. */
function project(c: CityView, x0: number, y0: number, w: number, h: number) {
  const lats = c.lessons.map((l) => l.lat);
  const lngs = c.lessons.map((l) => l.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const span = Math.max(maxLat - minLat, maxLng - minLng, 1e-6);
  const pad = 60;
  const size = Math.min(w, h - 40) - pad * 2;
  const cx = x0 + w / 2;
  const cy = y0 + (h - 40) / 2;
  return c.lessons.map((l) => ({
    id: l.id,
    x: cx + ((l.lng - (minLng + maxLng) / 2) / span) * size,
    y: cy - ((l.lat - (minLat + maxLat) / 2) / span) * size,
  }));
}

// A fixed field of faint background stars (seeded, so it never jumps).
const BACKGROUND: [number, number, number, number][] = (() => {
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 90 }, () => [rnd(), rnd(), rnd() * 1.2 + 0.3, rnd() * 0.5 + 0.1]);
})();

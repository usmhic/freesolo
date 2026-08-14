"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CITIES: { name: string; country: string; coords: [number, number] }[] = [
  { name: "Lisbon",       country: "Portugal",   coords: [-9.14,   38.72]  },
  { name: "Barcelona",    country: "Spain",      coords: [2.17,    41.39]  },
  { name: "Amsterdam",    country: "Netherlands",coords: [4.90,    52.37]  },
  { name: "Istanbul",     country: "Türkiye",    coords: [28.98,   41.01]  },
  { name: "Marrakech",    country: "Morocco",    coords: [-8.00,   31.64]  },
  { name: "Cairo",        country: "Egypt",      coords: [31.24,   30.04]  },
  { name: "Nairobi",      country: "Kenya",      coords: [36.82,   -1.29]  },
  { name: "Cape Town",    country: "S. Africa",  coords: [18.42,  -33.93]  },
  { name: "Bangkok",      country: "Thailand",   coords: [100.52,  13.76]  },
  { name: "Tokyo",        country: "Japan",      coords: [139.69,  35.69]  },
  { name: "Seoul",        country: "S. Korea",   coords: [126.98,  37.57]  },
  { name: "Melbourne",    country: "Australia",  coords: [144.96, -37.81]  },
  { name: "Mexico City",  country: "Mexico",     coords: [-99.13,  19.43]  },
  { name: "Buenos Aires", country: "Argentina",  coords: [-58.38, -34.60]  },
  { name: "Montreal",     country: "Canada",     coords: [-73.55,  45.51]  },
];

export function WorldMapSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="border-b border-fd-border bg-fd-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Section headline */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
            🌍 {CITIES.length} cities and growing
          </span>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Experiences everywhere you&apos;re headed
          </h2>
          <p className="mt-3 text-balance text-fd-muted-foreground">
            From a sunrise hike in Cape Town to a jazz cellar in Lisbon — every
            pin is a city with vetted local hosts ready to show you a side of it
            you wouldn&apos;t find on your own.
          </p>
        </div>

        {/* Map + tooltip */}
        <div className="relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
          {/* Gradient vignette */}
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl [mask-image:radial-gradient(ellipse_at_center,transparent_60%,black_100%)] bg-fd-background/40" />

          <ComposableMap
            projectionConfig={{ scale: 145, center: [15, 10] }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "var(--color-fd-muted, #e2e8f0)",
                        stroke: "var(--color-fd-border, #cbd5e1)",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      hover: {
                        fill: "var(--color-fd-accent, #ddd6fe)",
                        outline: "none",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {CITIES.map(({ name, country, coords }) => {
              const isHovered = hovered === name;
              return (
                <Marker
                  key={name}
                  coordinates={coords}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Pulse ring on hover */}
                  {isHovered && (
                    <circle
                      r={10}
                      fill="none"
                      stroke="var(--color-fd-primary, #7c3aed)"
                      strokeWidth={1.2}
                      opacity={0.35}
                    />
                  )}
                  <circle
                    r={isHovered ? 5 : 3.5}
                    fill="var(--color-fd-primary, #7c3aed)"
                    stroke="var(--color-fd-background, #ffffff)"
                    strokeWidth={1.2}
                    style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={-46}
                        y={-32}
                        width={92}
                        height={24}
                        rx={5}
                        fill="var(--color-fd-popover, #1e1b4b)"
                        opacity={0.93}
                      />
                      <text
                        textAnchor="middle"
                        y={-15}
                        style={{
                          fontFamily: "inherit",
                          fontSize: 10,
                          fontWeight: 600,
                          fill: "var(--color-fd-popover-foreground, #f8fafc)",
                          pointerEvents: "none",
                        }}
                      >
                        {name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-4}
                        style={{
                          fontFamily: "inherit",
                          fontSize: 8,
                          fill: "var(--color-fd-muted-foreground, #94a3b8)",
                          pointerEvents: "none",
                        }}
                      >
                        {country}
                      </text>
                    </g>
                  )}
                </Marker>
              );
            })}
          </ComposableMap>

          {/* City count badge */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/90 px-3 py-1.5 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-fd-primary" />
            <span className="text-xs font-medium text-fd-foreground">
              {CITIES.length} cities
            </span>
          </div>
        </div>

        {/* City chip list */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CITIES.map(({ name }) => (
            <span
              key={name}
              className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { thumb, type Photo } from "@/lib/play";

/**
 * A place photo from Wikimedia Commons with its licence credit, falling back
 * to the city's colours and emoji if there's no photo or it fails to load.
 */
export function PlacePhoto({
  photo,
  width = 960,
  emoji,
  colors,
  alt,
  credit = false,
  className,
  imgClassName,
  priority,
  veiled = false,
}: {
  photo: Photo | null | undefined;
  width?: 330 | 500 | 960 | 1280;
  emoji?: string;
  colors?: [string, string];
  alt: string;
  credit?: boolean;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Blurred and grey until the level is solved, so the photo can't give the answer away. */
  veiled?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const show = photo && !failed;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={colors ? { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` } : undefined}
    >
      {show ? (
        // Wikimedia serves the sized thumbnails itself, so a plain <img> is right here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb(photo.url, width)}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[filter,transform] duration-1000 ease-out",
            veiled && "scale-110 blur-xl grayscale",
            imgClassName
          )}
        />
      ) : (
        emoji && <span aria-hidden className="absolute inset-0 flex items-center justify-center text-[min(40cqw,6rem)]">{emoji}</span>
      )}
      {show && credit && !veiled && (
        <a
          href={photo.page}
          target="_blank"
          rel="noreferrer"
          title={`Photo: ${photo.author} · ${photo.license} · Wikimedia Commons`}
          className="absolute bottom-1.5 end-1.5 z-10 max-w-[70%] truncate rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur hover:bg-black/60"
        >
          📷 {photo.author} · {photo.license}
        </a>
      )}
    </div>
  );
}

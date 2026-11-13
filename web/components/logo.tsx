import Image from "next/image";
import { cn } from "@/lib/cn";

// FreeSolo wordmark: the road-and-sun mark from /public/logo.png (light pages)
// and /public/logo-dark.png (dark pages, swapped via the `.logo-*` rules in
// app/global.css), with "Free" in ink and "Solo" in sunset.
export function FreeSoloLogo({ className, markClassName, textClassName }: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        priority
        className={cn("logo-mark-light size-7 shrink-0", markClassName)}
      />
      <Image
        src="/logo-dark.png"
        alt=""
        width={32}
        height={32}
        priority
        className={cn("logo-mark-dark size-7 shrink-0", markClassName)}
      />
      <span className={cn("font-display text-lg font-extrabold leading-none tracking-tight", textClassName)}>
        Free<span className="text-sunset">Solo</span>
      </span>
    </span>
  );
}

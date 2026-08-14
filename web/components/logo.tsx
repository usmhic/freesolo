import Image from "next/image";
import { cn } from "@/lib/cn";

// FreeSolo wordmark — pairs the brand mark from /public/logo.png (light
// pages) and /public/logo-dark.png (dark pages, swapped via the `.logo-*`
// rules in app/global.css) with the "Free*Solo*" treatment from
// mobile/src/components/UI.tsx.
export function FreeSoloLogo({ className, markClassName, textClassName }: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="FreeSolo"
        width={28}
        height={28}
        className={cn("logo-mark-light size-6 shrink-0 rounded-md", markClassName)}
      />
      <Image
        src="/logo-dark.png"
        alt="FreeSolo"
        width={28}
        height={28}
        className={cn("logo-mark-dark size-6 shrink-0 rounded-md", markClassName)}
      />
      <span className={cn("font-display text-base font-semibold leading-none", textClassName)}>
        Free<span className="italic text-[#B8976A]">Solo</span>
      </span>
    </span>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/** "← Back to …" above a page; padded to a full tap target without shifting the layout. */
export function BackLink({ href, children, onDark = false }: { href: string; children: ReactNode; onDark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "-my-2.5 inline-flex items-center gap-1.5 py-2.5 text-sm font-medium",
        onDark ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-ink"
      )}
    >
      <ArrowLeft className="size-4" /> {children}
    </Link>
  );
}

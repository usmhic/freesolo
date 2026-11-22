import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TITLE = {
  h1: "font-display text-4xl font-extrabold tracking-tight sm:text-5xl",
  h2: "font-display text-3xl font-extrabold tracking-tight sm:text-4xl",
};

/**
 * The eyebrow, title and lead that open a page (`as="h1"`) or a section.
 * An `action` (a link or chip) sits beside the text from `sm` up and below it on phones.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  as: Tag = "h2",
  center = false,
  dark = false,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  center?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const text = (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag className={cn("mt-3", TITLE[Tag])}>{title}</Tag>
      {lead && <p className={cn("mt-3", Tag === "h1" && "text-lg", dark ? "text-white/75" : "text-ink-soft")}>{lead}</p>}
    </div>
  );
  if (!action) return <div className={className}>{text}</div>;
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end", className)}>
      {text}
      {action}
    </div>
  );
}

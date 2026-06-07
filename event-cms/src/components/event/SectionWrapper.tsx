import type { ReactNode, CSSProperties } from "react";
import type { DecorationItem } from "@/lib/types";
import DecorationLayer from "./DecorationLayer";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: ReactNode;
  decorations?: DecorationItem[];
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/**
 * Shared wrapper for all event page sections.
 * Provides relative positioning so DecorationLayer can be absolutely placed,
 * and a smooth-scroll anchor via `id`.
 */
export default function SectionWrapper({
  children,
  decorations,
  className,
  id,
  style,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("relative overflow-hidden", className)}
      style={{ scrollMarginTop: "4rem", ...style }}
    >
      {decorations && decorations.length > 0 && (
        <DecorationLayer decorations={decorations} />
      )}
      {children}
    </section>
  );
}

import Image from "next/image";
import type { DecorationItem } from "@/lib/types";

interface DecorationLayerProps {
  decorations: DecorationItem[];
}

/**
 * Absolutely-positioned decoration overlay.
 * pointer-events-none so it never blocks interactive content.
 * z-index 10 to sit above section content but below modals.
 */
export default function DecorationLayer({ decorations }: DecorationLayerProps) {
  if (!decorations || decorations.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {decorations.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.positionX}%`,
            top: `${item.positionY}%`,
            width: item.width,
            height: item.height,
            transform: `rotate(${item.rotation}deg)`,
            opacity: item.opacity,
            zIndex: item.zIndex,
          }}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes={`${item.width}px`}
            style={{ objectFit: "contain" }}
            priority={false}
          />
        </div>
      ))}
    </div>
  );
}

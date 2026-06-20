"use client";
import { useMemo } from "react";

const COLORS = ["var(--honey)", "var(--lavender-strong)", "var(--green)", "var(--red)", "var(--yellow)"];

export function ConfettiRender() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 0.9 + Math.random() * 0.6,
        color: COLORS[i % COLORS.length],
        size: 5 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="relative h-0" aria-hidden="true">
      <div className="relative w-full" style={{ height: 0 }}>
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${p.left}%`,
              top: 0,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s 1`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

export function PtsBadge({ pts }: { pts: number }) {
  const lottieRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const lottie = (await import("lottie-web")).default;
        const res = await fetch("/data/animation/confetti.json");
        const animData = await res.json();
        if (cancelled || !lottieRef.current) return;
        animRef.current = lottie.loadAnimation({
          container: lottieRef.current,
          renderer: "svg",
          loop: false,
          autoplay: true,
          animationData: animData,
        });
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
      animRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex items-end gap-2.5 justify-start">
      <div style={{ width: "32px", flexShrink: 0 }} />

      <div style={{ position: "relative", width: "310px", height: "310px" }}>
        <div
          ref={lottieRef}
          className="pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        <img
          src="/assets/confetti.png"
          alt=""
          draggable={false}
          className="pointer-events-none select-none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.18))",
            zIndex: 5,
          }}
        />

        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-display animate-pop"
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--honey-light)",
            color: "var(--honey-dark)",
            zIndex: 20,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <Star size={13} strokeWidth={2.6} fill="var(--honey-dark)" />
          +{pts} pts
        </div>
      </div>
    </div>
  );
}
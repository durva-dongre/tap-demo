"use client";
import { useEffect, useRef } from "react";

interface Props {
  videoPts: number;
  submissionPts: number;
  quizPts: number;
  total: number;
}

export function ScoreCard({ videoPts, submissionPts, quizPts, total }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const lottie = (await import("lottie-web")).default;
        const res = await fetch("/data/animation/confetti.json");
        const animData = await res.json();
        if (cancelled || !containerRef.current) return;
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
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

  const rows = [
    { label: "Video", pts: videoPts, emoji: "🎬" },
    { label: "Submission", pts: submissionPts, emoji: "📝" },
    { label: "Quiz", pts: quizPts, emoji: "🧠" },
  ].filter(r => r.pts > 0);

  return (
    <div className="pl-10 relative">
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{ width: "100%", height: "220px", top: "-60px" }}
      />
      <div className="card-float p-5 flex flex-col gap-4">
        <div className="text-center">
          <p className="text-4xl mb-1">🏆</p>
          <p className="font-display font-extrabold text-2xl" style={{ color: "var(--text-main)" }}>
            {total > 0 ? `+${total} pts` : "Great effort!"}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Today's score</p>
        </div>

        {rows.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "var(--bg)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{r.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>{r.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--lavender-strong)" }}>+{r.pts}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "var(--lavender)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--lavender-strong)" }}>Total</span>
              <span className="text-sm font-bold" style={{ color: "var(--lavender-strong)" }}>+{total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
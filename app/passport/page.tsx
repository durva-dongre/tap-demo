"use client";
import { useStudent } from "@/lib/student-context";
import { BottomNav } from "@/components/shared/BottomNav";
import {
  Shield, Zap, Award, Gem, Hexagon,
  GraduationCap, Play, Upload, Brain,
  Trophy, Crown, Sparkles,
  Lock, CheckCircle2,
} from "lucide-react";

type Tier = {
  name: string;
  min: number;
  max: number;
  Icon: React.ElementType;
  bar: string;
  bg: string;
  text: string;
  badge: string;
};

const TIERS: Tier[] = [
  { name: "Bronze",   min: 0,    max: 399,      Icon: Shield,   bar: "#CD7F32", bg: "#FDF0E6", text: "#A0522D", badge: "#A0522D" },
  { name: "Silver",   min: 400,  max: 999,      Icon: Zap,      bar: "#A8B2BE", bg: "#F0F2F5", text: "#5A6472", badge: "#5A6472" },
  { name: "Gold",     min: 1000, max: 1999,     Icon: Award,    bar: "#F5C400", bg: "#FFFBE6", text: "#8A6800", badge: "#8A6800" },
  { name: "Platinum", min: 2000, max: 4999,     Icon: Gem,      bar: "#5BC0C0", bg: "#EFF8F8", text: "#2A6B6B", badge: "#2A6B6B" },
  { name: "Diamond",  min: 5000, max: Infinity, Icon: Hexagon,  bar: "#7B73F0", bg: "#EEF0FF", text: "#3B31C4", badge: "#3B31C4" },
];

type Badge = {
  id: string;
  label: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  desc: string;
  req: (p: number, has: boolean) => boolean;
};

const BADGES: Badge[] = [
  { id: "enrolled",  label: "Enrolled",      Icon: GraduationCap, iconColor: "#7B73F0", iconBg: "#EEF0FF", desc: "Picked a course",     req: (_p, has) => has },
  { id: "first-vid", label: "Video Star",    Icon: Play,          iconColor: "#E74C3C", iconBg: "#FEF0EF", desc: "Watched first video",  req: (p) => p >= 10 },
  { id: "submitter", label: "First Submit",  Icon: Upload,        iconColor: "#F39C12", iconBg: "#FFFBE6", desc: "Sent in a submission", req: (p) => p >= 35 },
  { id: "quiz-bird", label: "Quiz Bird",     Icon: Brain,         iconColor: "#2A6B6B", iconBg: "#EFF8F8", desc: "Finished first quiz",  req: (p) => p >= 80 },
  { id: "silver-cl", label: "Silver Club",   Icon: Zap,           iconColor: "#5A6472", iconBg: "#F0F2F5", desc: "400 points earned",    req: (p) => p >= 400 },
  { id: "gold-cl",   label: "Gold Club",     Icon: Award,         iconColor: "#8A6800", iconBg: "#FFFBE6", desc: "1,000 points earned",  req: (p) => p >= 1000 },
  { id: "plat-cl",   label: "Platinum Club", Icon: Trophy,        iconColor: "#2A6B6B", iconBg: "#EFF8F8", desc: "2,000 points earned",  req: (p) => p >= 2000 },
  { id: "diamond",   label: "Diamond",       Icon: Sparkles,      iconColor: "#3B31C4", iconBg: "#EEF0FF", desc: "5,000 points earned",  req: (p) => p >= 5000 },
];

export default function PassportPage() {
  const { student } = useStudent();
  const pts = student.points;
  const hasCourse = !!(student.courseId ?? student.selected_course);
  const currentTier = TIERS.slice().reverse().find(t => pts >= t.min) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1] ?? null;
  const pctInTier = nextTier
    ? Math.min(100, ((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;
  const { Icon: CurrentIcon } = currentTier;

  return (
    <div className="min-h-screen pb-24 lg:pl-[220px]" style={{ background: "var(--bg)" }}>
      <div className="px-5 lg:px-8 pt-6 pb-4">
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-main)" }}>Points & Rank</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Level up as you learn</p>
      </div>

      <div className="px-4 lg:px-8 flex flex-col lg:flex-row gap-6 lg:items-start" style={{ paddingRight: "0" }}>
        <div className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
          <div className="card-float p-5" style={{ background: currentTier.bg }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "white" }}>
                <CurrentIcon size={32} strokeWidth={1.8} style={{ color: currentTier.bar }} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: currentTier.text, opacity: 0.65 }}>Current rank</p>
                <p className="font-display font-extrabold text-3xl" style={{ color: currentTier.text }}>{currentTier.name}</p>
                <p className="font-display font-extrabold text-lg mt-0.5" style={{ color: currentTier.text }}>{pts.toLocaleString()} pts</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: currentTier.text, opacity: 0.7 }}>
                <span>{currentTier.name} {currentTier.min.toLocaleString()}</span>
                {nextTier && <span>{nextTier.name} {nextTier.min.toLocaleString()}</span>}
                {!nextTier && <span className="flex items-center gap-1"><Crown size={11} strokeWidth={2.4} /> Max rank</span>}
              </div>
              <div className="h-2.5 rounded-full" style={{ background: "rgba(0,0,0,0.10)" }}>
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${pctInTier}%`, background: currentTier.bar }} />
              </div>
              {nextTier && (
                <p className="text-xs mt-1.5 font-semibold flex items-center gap-1" style={{ color: currentTier.text, opacity: 0.65 }}>
                  {(nextTier.min - pts).toLocaleString()} pts to {nextTier.name}
                  <nextTier.Icon size={11} strokeWidth={2.4} style={{ color: nextTier.bar }} />
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>All tiers</p>
            <div className="card-float divide-y" style={{ borderColor: "var(--border-soft)" }}>
              {TIERS.map((t) => {
                const earned = pts >= t.min;
                const isCurrent = t.name === currentTier.name;
                return (
                  <div key={t.name} className="flex items-center gap-3 px-4 py-3" style={{ opacity: earned ? 1 : 0.4 }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.bg, color: t.bar }}>
                      <t.Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: t.badge }}>{t.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {t.max === Infinity ? `${t.min.toLocaleString()}+ pts` : `${t.min.toLocaleString()} – ${t.max.toLocaleString()} pts`}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.text }}>YOU</span>
                    )}
                    {earned && !isCurrent && (
                      <CheckCircle2 size={15} strokeWidth={2.4} style={{ color: "#27AE60" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 lg:pr-[220px]">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>Badges</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {BADGES.map(b => {
              const earned = b.req(pts, hasCourse);
              return (
                <div
                  key={b.id}
                  className="card-float p-4 flex flex-col items-center gap-2 text-center"
                  style={{ opacity: earned ? 1 : 0.35 }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: b.iconBg, color: b.iconColor }}>
                    {earned
                      ? <b.Icon size={22} strokeWidth={1.9} />
                      : <Lock size={18} strokeWidth={2.2} style={{ color: "var(--text-muted)" }} />
                    }
                  </div>
                  <p className="text-xs font-bold" style={{ color: "var(--text-main)" }}>{b.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{b.desc}</p>
                  {!earned && <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Locked</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block"
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          width: "200px",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <img
          src="/assets/medal.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            width: "200px",
            height: "auto",
            display: "block",
            objectFit: "contain",
            objectPosition: "bottom right",
          }}
        />
      </div>

      <BottomNav active="passport" />
    </div>
  );
}
"use client";
import { ChevronLeft } from "lucide-react";
import { BuddyChip } from "@/components/chat/BuddyChip";
import { BuddyContext } from "@/lib/groq";
import { useStudent } from "@/lib/student-context";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  points?: number;
  rightSlot?: React.ReactNode;
  buddyContext?: Partial<BuddyContext>;
  onBuddyOpen?: () => void;
  onBuddyClose?: () => void;
};

export function AppHeader({ title, subtitle, onBack, points, rightSlot, buddyContext, onBuddyOpen, onBuddyClose }: Props) {
  const { student } = useStudent();
  const cityLogo = (student as any).cityLogo as string | undefined;

  const resolvedBuddyContext: Partial<BuddyContext> = {
    studentName: student.name,
    ...buddyContext,
  };

  return (
    <div
      className="sticky top-0 z-20 w-full"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-soft)" }}
    >
      <div className="flex items-center gap-3 px-4 lg:px-8 py-3.5 w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <span className="font-display font-extrabold text-sm tracking-tight" style={{ color: "var(--lavender-strong)" }}>
              TAP
            </span>
            {cityLogo && (
              <img src={cityLogo} alt="city logo" className="w-6 h-6 object-contain" />
            )}
          </div>

          <div className="flex flex-col leading-tight min-w-0">
            <p className="font-display font-bold text-base truncate" style={{ color: "var(--text-main)" }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {typeof points === "number" && (
            <div className="chip" style={{ background: "var(--yellow)", color: "#7A6000" }}>
              {points} pts
            </div>
          )}
          {rightSlot}
          <BuddyChip
            context={resolvedBuddyContext}
            onOpen={onBuddyOpen}
            onClose={onBuddyClose}
          />
        </div>
      </div>
    </div>
  );
}
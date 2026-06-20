"use client";
import { ArrowRight, BookOpen } from "lucide-react";
import { CourseUnit, CourseData, getUnitName } from "@/lib/flow-engine";

type Props = {
  unit: CourseUnit | null;
  course: CourseData | null;
  onGo: () => void;
};

export function NextUnitCard({ unit, onGo }: Props) {
  if (!unit) {
    return (
      <div className="pl-10">
        <div className="card-float p-4 flex flex-col gap-2 items-start">
          <p className="font-display font-bold text-sm" style={{ color: "var(--text-main)" }}>
            That's every unit done for this course!
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Come back tomorrow for a fresh activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}
          >
            <BookOpen size={17} strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Up next
            </p>
            <p className="font-display font-bold text-sm" style={{ color: "var(--text-main)" }}>
              {getUnitName(unit)}
            </p>
          </div>
        </div>
        <button className="btn-primary px-5 py-2.5 text-sm self-start flex items-center gap-1.5" onClick={onGo}>
          Continue learning
          <ArrowRight size={15} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
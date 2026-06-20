"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { CourseData, getUnitName, getCourseName } from "@/lib/flow-engine";
import { AppHeader } from "../../components/shared/Appheader";
import { BottomNav } from "@/components/shared/BottomNav";
import { MessageCircle, BookOpen } from "lucide-react";

export default function HomePage() {
  const { student, hydrated } = useStudent();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!student.demoFilled) { router.replace("/demo"); return; }
    if (!student.onboardingDone) { router.replace("/onboarding"); }
  }, [hydrated, student.demoFilled, student.onboardingDone, router]);

  useEffect(() => {
    const courseId = student.courseId ?? student.selected_course;
    if (!courseId) return;
    const courseFile = courseId === "financial-verticals" ? "financial-vertical" : courseId;
    fetch(`/data/course/${courseFile}.json`).then(r => r.json()).then(setCourse);
  }, [student.courseId, student.selected_course]);

  const currentUnitIndex = student.currentUnitIndex ?? 0;
  const currentUnit = course?.units[currentUnitIndex] ?? null;
  const totalUnits = course?.units.length ?? 0;
  const progressPct = totalUnits > 0 ? Math.min(100, (currentUnitIndex / totalUnits) * 100) : 0;

  const tier = student.points >= 5000 ? "Diamond" : student.points >= 2000 ? "Platinum" : student.points >= 1000 ? "Gold" : student.points >= 400 ? "Silver" : "Bronze";
  const tierColors: Record<string, { bg: string; text: string; bar: string }> = {
    Bronze:   { bg: "#FDF0E6", text: "#A0522D", bar: "#CD7F32" },
    Silver:   { bg: "#F0F2F5", text: "#5A6472", bar: "#A8B2BE" },
    Gold:     { bg: "#FFFBE6", text: "#8A6800", bar: "#F5C400" },
    Platinum: { bg: "#EFF8F8", text: "#2A6B6B", bar: "#5BC0C0" },
    Diamond:  { bg: "#EEF0FF", text: "#3B31C4", bar: "#7B73F0" },
  };
  const tc = tierColors[tier];

  return (
    <div className="flex flex-col min-h-screen lg:pl-[220px]" style={{ background: "var(--bg)" }}>
      <AppHeader title="Home" subtitle={`Hi, ${student.name || "there"} 👋`} points={student.points} />

      <div className="flex-1 w-full px-4 lg:px-8 py-6 pb-28 lg:pb-10">
        <div className="max-w-6xl">

          <div className="hidden lg:flex items-end gap-0 mb-6" style={{ minHeight: "340px" }}>
            <div
              className="shrink-0 self-end"
              style={{ width: "200px", marginBottom: "-24px", marginRight: "-16px", zIndex: 1, pointerEvents: "none" }}
            >
              <img
                src="/assets/home.png"
                alt=""
                draggable={false}
                style={{ width: "200px", height: "auto", display: "block", objectFit: "contain", objectPosition: "bottom" }}
              />
            </div>

            <div
              className="flex-1 card-float p-6 overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, var(--lavender) 0%, var(--white) 65%)", zIndex: 2 }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    {course ? getCourseName(course) : "Your course"}
                  </p>
                  <p className="font-display font-extrabold text-2xl leading-tight mt-0.5" style={{ color: "var(--text-main)" }}>
                    {currentUnit ? getUnitName(currentUnit) : "Loading…"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Unit {currentUnitIndex + 1} of {totalUnits}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--white)", color: "var(--lavender-strong)" }}>
                  <PlayCircle size={24} strokeWidth={2.1} />
                </div>
              </div>
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  <span>Progress</span><span>{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "rgba(91,91,239,0.12)" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--lavender-strong)" }} />
                </div>
              </div>
              <button className="btn-primary py-3 text-sm px-8" onClick={() => router.push("/chat")}>
                Continue today's activity
              </button>
            </div>
          </div>

          <div className="lg:hidden mb-5">
            <div className="card-float p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--lavender) 0%, var(--white) 65%)" }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    {course ? getCourseName(course) : "Your course"}
                  </p>
                  <p className="font-display font-extrabold text-2xl leading-tight mt-0.5" style={{ color: "var(--text-main)" }}>
                    {currentUnit ? getUnitName(currentUnit) : "Loading…"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Unit {currentUnitIndex + 1} of {totalUnits}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--white)", color: "var(--lavender-strong)" }}>
                  <PlayCircle size={24} strokeWidth={2.1} />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  <span>Progress</span><span>{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "rgba(91,91,239,0.12)" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--lavender-strong)" }} />
                </div>
              </div>
              <button className="btn-primary py-3 text-sm w-full" onClick={() => router.push("/chat")}>
                Continue today's activity
              </button>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
            <div className="flex flex-col gap-5">
              {course && (
                <div className="flex flex-col gap-3">
                  <p className="font-display font-bold text-sm px-1" style={{ color: "var(--text-main)" }}>All units</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {course.units.map((u, i) => {
                      const isDone = i < currentUnitIndex;
                      const isCurrent = i === currentUnitIndex;
                      const isLocked = i > currentUnitIndex;
                      return (
                        <button
                          key={u.unit_id ?? i}
                          className="card-float p-4 flex items-center gap-3 text-left"
                          onClick={() => isCurrent && router.push("/chat")}
                          disabled={isLocked}
                          style={{ opacity: isLocked ? 0.45 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isDone ? "#EDFAF0" : isCurrent ? "var(--lavender)" : "var(--bg-soft)",
                              color: isDone ? "#27AE60" : isCurrent ? "var(--lavender-strong)" : "var(--text-muted)",
                            }}
                          >
                            {isDone ? <CheckCircle2 size={16} strokeWidth={2.4} /> : isLocked ? <Lock size={13} strokeWidth={2.4} /> : <span className="text-xs font-bold font-display">{i + 1}</span>}
                          </div>
                          <p className="text-sm font-semibold flex-1 truncate" style={{ color: "var(--text-main)" }}>
                            {getUnitName(u)}
                          </p>
                          {isCurrent && <ChevronRight size={17} strokeWidth={2.3} style={{ color: "var(--text-muted)" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-4 mt-0">
              <div className="card-float p-5" style={{ background: tc.bg }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold" style={{ color: tc.text }}>{tier} Tier</p>
                    <p className="font-display font-extrabold text-2xl mt-0.5" style={{ color: tc.text }}>{student.points.toLocaleString()} pts</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (student.points % 1000) / 10)}%`, background: tc.bar }} />
                </div>
              </div>

              <div className="card-float p-4 flex flex-col gap-2">
                <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Quick links</p>
                <button className="flex items-center gap-2 text-sm font-semibold py-2" style={{ color: "var(--lavender-strong)" }} onClick={() => router.push("/chat")}>
                  <MessageCircle size={15} strokeWidth={2.2} /> Start today's lesson
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold py-2" style={{ color: "var(--lavender-strong)" }} onClick={() => router.push("/passport")}>
                  <BookOpen size={15} strokeWidth={2.2} /> View passport & badges
                </button>
              </div>
            </div>

            <div className="lg:hidden mt-4">
              <div className="card-float p-4 flex items-center gap-3" style={{ background: tc.bg }}>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: tc.text }}>{tier} Tier</p>
                  <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (student.points % 1000) / 10)}%`, background: tc.bar }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-extrabold text-xl" style={{ color: tc.text }}>{student.points}</p>
                  <p className="text-[10px] font-semibold" style={{ color: tc.text, opacity: 0.7 }}>pts</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
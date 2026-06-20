"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import { BottomNav } from "@/components/shared/BottomNav";
import { DEMO_PRESETS, Language, Student } from "@/lib/student-context";
import { Pencil, Check, X, LogOut, ChevronRight, UserCircle2 } from "lucide-react";

const LANGUAGES: Language[] = ["English", "Hindi", "Marathi", "Punjabi", "Kannada"];

type EditKey = "name" | "phone" | "school" | "class" | "subject" | "language";

const FIELDS: { key: EditKey; label: string; type: "text" | "select"; options?: string[] }[] = [
  { key: "name",     label: "Name",              type: "text" },
  { key: "phone",    label: "Phone",             type: "text" },
  { key: "school",   label: "School",            type: "text" },
  { key: "class",    label: "Class / Grade",     type: "text" },
  { key: "subject",  label: "Favourite subject", type: "text" },
  { key: "language", label: "Language",          type: "select", options: LANGUAGES },
];

export default function ProfilePage() {
  const { student, updateStudent, resetStudent } = useStudent();
  const router = useRouter();

  const [editKey, setEditKey] = useState<EditKey | null>(null);
  const [editVal, setEditVal] = useState("");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const startEdit = (key: EditKey) => {
    setEditKey(key);
    setEditVal(String((student as unknown as Record<string, unknown>)[key] ?? ""));
  };

  const saveEdit = () => {
    if (!editKey) return;
    updateStudent({ [editKey]: editVal } as Partial<Student>);
    setEditKey(null);
  };

  const cancelEdit = () => setEditKey(null);

  const switchProfile = (preset: Student) => {
    updateStudent({
      name: preset.name, phone: preset.phone, language: preset.language,
      school: preset.school, class: preset.class, subject: preset.subject,
      hasSibling: preset.hasSibling, demoFilled: true, onboardingDone: true,
    });
    setShowSwitcher(false);
  };

  const handleReset = () => {
    resetStudent();
    router.replace("/demo");
  };

  const courseLabel = (student.courseId ?? student.selected_course ?? "").replace(/-/g, " ") || "None";
  const initials = (student.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen pb-24 lg:pl-[220px]" style={{ background: "var(--bg)" }}>
      <div className="px-5 lg:px-8 pt-6 pb-4">
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-main)" }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Your details and account settings</p>
      </div>

      <div className="px-4 lg:px-8 flex flex-col lg:flex-row gap-6 lg:items-start max-w-6xl">

        <div className="lg:w-72 lg:shrink-0 flex flex-col gap-4">
          <div className="card-float p-5 flex flex-col items-center text-center gap-3" style={{ background: "linear-gradient(135deg, var(--lavender) 0%, var(--white) 70%)" }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-display"
              style={{ background: "var(--lavender-strong)", color: "white" }}
            >
              {initials}
            </div>
            <div>
              <p className="font-display font-extrabold text-xl" style={{ color: "var(--text-main)" }}>{student.name || "—"}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{student.school || "No school set"}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="chip text-[10px]" style={{ background: "var(--white)", color: "var(--lavender-strong)" }}>{student.points} pts</span>
              <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{courseLabel}</span>
            </div>
          </div>

          <div className="card-float">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              onClick={() => setShowSwitcher(s => !s)}
            >
              <UserCircle2 size={18} strokeWidth={2.2} style={{ color: "var(--lavender-strong)" }} />
              <span className="text-sm font-semibold flex-1" style={{ color: "var(--text-main)" }}>Switch profile</span>
              <ChevronRight size={16} strokeWidth={2.2} style={{ color: "var(--text-muted)", transform: showSwitcher ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {showSwitcher && (
              <div className="border-t px-4 pb-3 pt-2 flex flex-col gap-1" style={{ borderColor: "var(--border-soft)" }}>
                {DEMO_PRESETS.map((p, i) => {
                  const isCurrent = p.name === student.name;
                  return (
                    <button
                      key={i}
                      onClick={() => !isCurrent && switchProfile(p)}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-xl text-left"
                      style={{ background: isCurrent ? "var(--lavender)" : "transparent" }}
                      disabled={isCurrent}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display shrink-0"
                        style={{ background: isCurrent ? "var(--lavender-strong)" : "var(--bg-soft)", color: isCurrent ? "white" : "var(--text-muted)" }}
                      >
                        {p.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-main)" }}>{p.name}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{p.school}</p>
                      </div>
                      {isCurrent && <span className="text-[10px] font-bold" style={{ color: "var(--lavender-strong)" }}>Active</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t" style={{ borderColor: "var(--border-soft)" }}>
              {!showResetConfirm ? (
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={() => setShowResetConfirm(true)}>
                  <LogOut size={18} strokeWidth={2.2} style={{ color: "#E74C3C" }} />
                  <span className="text-sm font-semibold" style={{ color: "#E74C3C" }}>Reset & start over</span>
                </button>
              ) : (
                <div className="px-4 py-3.5 flex flex-col gap-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>Reset your account?</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>All points and progress will be cleared. This cannot be undone.</p>
                  <div className="flex gap-2 mt-1">
                    <button onClick={handleReset} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#E74C3C", color: "white" }}>
                      Yes, reset
                    </button>
                    <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>Edit details</p>
          <div className="card-float divide-y" style={{ borderColor: "var(--border-soft)" }}>
            {FIELDS.map(f => {
              const val = String((student as unknown as Record<string, unknown>)[f.key] ?? "");
              const isEditing = editKey === f.key;
              return (
                <div key={f.key} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{f.label}</p>
                    {!isEditing && (
                      <button onClick={() => startEdit(f.key)} style={{ color: "var(--lavender-strong)" }}>
                        <Pencil size={14} strokeWidth={2.4} />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 flex flex-col gap-2">
                      {f.type === "select" ? (
                        <select className="pill-input text-sm w-full" value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus>
                          {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          className="pill-input text-sm w-full"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                        />
                      )}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "var(--lavender-strong)", color: "white" }}>
                          <Check size={13} strokeWidth={2.6} /> Save
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}>
                          <X size={13} strokeWidth={2.6} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{val || "—"}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <BottomNav active="profile" />
    </div>
  );
}
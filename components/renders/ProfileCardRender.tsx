"use client";
import { Pencil, Check } from "lucide-react";
import { useState } from "react";
import { ProfileField } from "@/lib/flow-engine";
import { Student } from "@/lib/student-context";

type Props = {
  fields: ProfileField[] | undefined;
  student: Student;
  editing: Record<string, string>;
  answered?: boolean;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
};

export function ProfileCardRender({ fields, student, editing, answered, onChange, onSave }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (!fields || fields.length === 0) return null;

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        {fields.map(f => {
          const current = editing[f.key] !== undefined ? editing[f.key] : String((student as unknown as Record<string, unknown>)[f.key] ?? "");
          const isEditing = activeKey === f.key;
          return (
            <div key={f.key} className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {f.label}
                </span>
                {isEditing && !answered ? (
                  <input
                    autoFocus
                    className="field-input mt-1"
                    value={current}
                    onChange={e => onChange(f.key, e.target.value)}
                    onBlur={() => setActiveKey(null)}
                    onKeyDown={e => e.key === "Enter" && setActiveKey(null)}
                  />
                ) : (
                  <span className="font-semibold text-sm truncate" style={{ color: "var(--text-main)" }}>
                    {current || "—"}
                  </span>
                )}
              </div>
              {!answered && (
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--bg-soft)", color: "var(--lavender-strong)" }}
                  onClick={() => setActiveKey(isEditing ? null : f.key)}
                  aria-label={`Edit ${f.label}`}
                >
                  <Pencil size={14} strokeWidth={2.3} />
                </button>
              )}
            </div>
          );
        })}

        {!answered && (
          <button className="btn-primary mt-1 px-5 py-2.5 text-sm flex items-center justify-center gap-1.5" onClick={onSave}>
            <Check size={16} strokeWidth={2.6} />
            Looks good
          </button>
        )}
      </div>
    </div>
  );
}
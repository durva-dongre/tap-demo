"use client";

export type CourseCardOption = {
  id: string;
  label: string;
  emoji: string;
  tint: string;
};

type Props = {
  options: CourseCardOption[];
  onSelect: (id: string) => void;
};

export function CourseCardGrid({ options, onSelect }: Props) {
  return (
    <div className="pl-10 mt-1 grid grid-cols-2 gap-3 max-w-sm">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className="course-card flex flex-col items-center justify-center gap-2 aspect-square rounded-3xl p-4 transition-transform"
          style={{ background: o.tint }}
        >
          <span className="text-3xl">{o.emoji}</span>
          <span className="font-display font-semibold text-sm text-center" style={{ color: "var(--text-main)" }}>
            {o.label}
          </span>
        </button>
      ))}
      <style jsx>{`
        .course-card {
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .course-card:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}
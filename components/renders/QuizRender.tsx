"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type QuizQuestion = {
  question?: string;
  voice_text?: string;
  options?: Array<{ id?: string; value?: string; label: string }>;
  correct_option?: string;
  correctId?: string;
  consolation?: string;
  hint?: string;
  explanation?: string;
  [key: string]: unknown;
};

interface Props {
  question: QuizQuestion;
  answered?: boolean;
  onAnswer: (correct: boolean) => void;
  enqueueAudio: (key: string, src: string, onDone?: () => void) => void;
  replayAudio: (src: string, key: string) => void;
  activeAudioKey: string | null;
  stopAudioQueue: () => void;
}

export function QuizRender({ question, answered, onAnswer, stopAudioQueue }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = question.options ?? [];
  const correctVal = question.correct_option ?? question.correctId ?? "";

  const handleTap = (val: string) => {
    if (selected !== null || answered) return;
    stopAudioQueue();
    setSelected(val);
    const correct = val === correctVal;
    onAnswer(correct);
  };

  const getState = (val: string) => {
    if (selected === null && !answered) return "idle";
    if (val === correctVal) return "correct";
    if (val === selected && val !== correctVal) return "wrong";
    return "dim";
  };

  const styleForState = (state: string): React.CSSProperties => {
    if (state === "correct") return { background: "#EDFAF0", borderColor: "#27AE60", color: "#1A7A40" };
    if (state === "wrong") return { background: "#FEF0EF", borderColor: "#E74C3C", color: "#C0392B" };
    if (state === "dim") return { opacity: 0.45 };
    return {};
  };

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        <p className="font-display font-bold text-sm leading-snug" style={{ color: "var(--text-main)" }}>
          {question.question ?? question.voice_text ?? ""}
        </p>

        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const val = opt.value ?? opt.id ?? String(i);
            const state = getState(val);
            return (
              <button
                key={val}
                onClick={() => handleTap(val)}
                disabled={selected !== null || !!answered}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2"
                style={{
                  border: "1.5px solid var(--border-soft)",
                  color: "var(--text-main)",
                  background: "var(--white)",
                  ...styleForState(state),
                }}
              >
                <span className="flex-1">{opt.label}</span>
                {state === "correct" && <CheckCircle2 size={16} strokeWidth={2.4} style={{ color: "#27AE60", flexShrink: 0 }} />}
                {state === "wrong" && <XCircle size={16} strokeWidth={2.4} style={{ color: "#E74C3C", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {(selected !== null || answered) && question.explanation && (
          <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
            <span className="font-bold">Explanation: </span>{question.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
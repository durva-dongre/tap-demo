#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "🐝 TAP Buddy — full setup"

# ── DELETE DEAD FILES ─────────────────────────────────────────────────────────
rm -rf app/achievement app/class app/error app/login app/profile
rm -rf app/quiz app/settings app/setup app/submission app/video
rm -f  app/loading.tsx app/page.tsx
rm -rf components/cards components/profile components/setup components/widgets
rm -f  components/shared/Confetti.tsx components/shared/ErrorScreen.tsx
rm -f  components/shared/Header.tsx components/shared/LoadingScreen.tsx
rm -f  components/shared/Modal.tsx
rm -f  components/chat/ChatBubble.tsx components/chat/ChatInput.tsx
rm -f  components/chat/MessageRenderer.tsx components/chat/ReplayButton.tsx
rm -f  components/chat/TapBuddy.tsx
rm -f  components/AchievementCard.tsx components/ChatBubble.tsx
rm -f  components/CourseSelect.tsx components/GoalCard.tsx
rm -f  components/Header.tsx components/ProgressWidget.tsx
rm -f  components/QuizCard.tsx components/SubmissionCard.tsx
rm -f  components/TapBuddy.tsx components/VideoCard.tsx components/Widget.tsx
rm -f  lib/achievements.ts lib/audio-engine.ts lib/constants.ts
rm -f  lib/course-loader.ts lib/helpers.ts lib/points-engine.ts
rm -f  lib/quiz-engine.ts lib/storage.ts
rm -rf context hooks styles types
rm -rf public/data/courses public/data/quizzes public/data/students
rm -f  public/data/app.json public/data/schools.json public/data/achievements.json
rm -rf tap-demo
echo "🗑  Dead files removed"

# ── ENSURE DIRECTORIES ────────────────────────────────────────────────────────
mkdir -p app/onboarding app/home app/chat app/passport
mkdir -p components/chat components/renders components/shared
mkdir -p lib

# ── .env.local ────────────────────────────────────────────────────────────────
if [ ! -f .env.local ]; then
cat > .env.local << 'EOF'
NEXT_PUBLIC_GROQ_API_KEY=
EOF
echo "⚠️  Add your Groq key to .env.local"
fi

# ── lib/flow-engine.ts ────────────────────────────────────────────────────────
cat > lib/flow-engine.ts << 'EOF'
import { Student } from "./student-context";

export type StepType =
  | "message" | "choice" | "confirm" | "confetti"
  | "profile-card" | "reward" | "cta" | "dynamic" | "static";

export interface StepOption {
  id?: string;
  value?: string;
  label: string;
  next?: string;
  next_step?: string;
  route?: string;
  courseId?: string;
}

export interface ProfileField {
  key: string;
  label: string;
  type?: string;
  cached?: boolean;
  options?: string[];
  editAudio?: string;
  placeholder?: string;
  input_mode?: string;
  cache_field?: string;
}

export interface FlowStep {
  index: number | string;
  id?: string;
  step_id?: string;
  type?: StepType | string;
  from?: "buddy" | "user";
  sender?: string;
  text?: string;
  display_text?: string;
  audio?: string;
  audio_location?: string;
  render?: string;
  pts?: number;
  points_awarded?: number;
  next?: string;
  next_step?: string | null;
  back_step?: string | null;
  options?: StepOption[];
  fields?: ProfileField[];
  form_fields?: ProfileField[];
  confirmText?: string;
  courseId?: string;
  contentRef?: string;
  content_ref?: Record<string, unknown>;
  scoreRef?: string;
  questionIndex?: number;
  hintAudio?: string;
  explanationAudio?: string;
  consolationAudio?: string;
  delayMs?: number;
  delay_after_submit_ms?: number;
  actions?: StepOption[];
  onCorrect?: { next: string; pts: number };
  on_correct?: { next_step: string };
  onWrong?: { next: string };
  on_wrong?: { next_step: string };
  fallback?: string;
  fallback_guide?: string | null;
  editAudio?: string;
  input_mode?: string;
  cache_fields?: string[];
  variants?: Record<string, { display_text: string; voice_text: string }>;
  sub_display?: { fields: ProfileField[] };
  skip_warning?: { display_text: string };
  on_complete_event?: string;
  courseId_selected?: string;
  question_number?: number;
}

export interface FlowData {
  id?: string;
  flow_id?: string;
  version?: number;
  steps: FlowStep[];
  _meta?: Record<string, unknown>;
}

export interface CourseUnit {
  unit_index?: number;
  unitNumber?: number;
  id?: string;
  unit_id?: string;
  name?: string;
  unit_name?: string;
  description?: string;
  audio_location?: string;
  video: {
    ref?: string;
    render_key?: string;
    title: string;
    description?: string;
    voice_text?: string;
    url?: string;
    youtube_url?: string;
    thumbnail?: string;
    audio?: string;
    audio_location?: string;
    durationSecs?: number;
    points?: number;
  };
  submission: {
    ref?: string;
    render_key?: string;
    title?: string;
    prompt: string;
    voice_text?: string;
    type?: string;
    audio?: string;
    audio_location?: string;
    maxChars?: number;
    points?: number;
    emoji_options?: { emoji: string; label: string }[];
    reference_submissions?: { title: string; description: string; image_url: string | null }[];
  };
  quiz: Array<{
    ref?: string;
    question?: string;
    voice_text?: string;
    options?: Array<{ id?: string; value?: string; label: string }>;
    correctId?: string;
    correct_option?: string;
    audio?: string;
    audio_location?: string;
    hintAudio?: string;
    audio_location_hint?: string;
    explanationAudio?: string;
    audio_location_explanation?: string;
    consolationAudio?: string;
    audio_location_consolation?: string;
    audio_location_cheer_up?: string;
    consolation?: string;
    hint?: string;
    explanation?: string;
  }> | { questions: Array<{
    question_index: number;
    question: string;
    voice_text?: string;
    audio_location?: string;
    options: Array<{ label: string; value: string }>;
    correct_option: string;
    consolation?: string;
    consolation_voice_text?: string;
    audio_location_consolation?: string;
    audio_location_cheer_up?: string;
    hint?: string;
    hint_voice_text?: string;
    audio_location_hint?: string;
    explanation?: string;
    explanation_voice_text?: string;
    audio_location_explanation?: string;
  }> };
}

export interface CourseData {
  id?: string;
  course_id?: string;
  name?: string;
  course_display?: string;
  emoji?: string;
  units: CourseUnit[];
  _meta?: Record<string, unknown>;
}

export function getPartOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 20) return "Evening";
  return "Night";
}

export function stepId(s: FlowStep): string {
  return s.step_id ?? s.id ?? String(s.index);
}

export function stepNext(s: FlowStep): string | null {
  return s.next_step !== undefined ? (s.next_step ?? null) : (s.next ?? null);
}

export function stepAudio(s: FlowStep): string {
  return s.audio_location ?? s.audio ?? "";
}

export function stepText(s: FlowStep): string {
  return s.display_text ?? s.text ?? "";
}

export function stepInputMode(s: FlowStep): string {
  if (s.input_mode) return s.input_mode;
  if (s.type === "choice" || s.type === "confirm" || s.type === "cta") return "buttons_only";
  if (s.type === "profile-card") return "form";
  return "static";
}

export function stepOptions(s: FlowStep): StepOption[] {
  return s.options ?? s.actions ?? [];
}

export function getUnitQuestions(unit: CourseUnit) {
  if (Array.isArray(unit.quiz)) return unit.quiz;
  if (unit.quiz && "questions" in unit.quiz) return unit.quiz.questions;
  return [];
}

export function getUnitName(u: CourseUnit): string {
  return u.unit_name ?? u.name ?? "";
}

export function getCourseName(c: CourseData): string {
  return c.course_display ?? c.name ?? "";
}

export function interpolate(
  text: string,
  student: Student,
  unit?: CourseUnit,
  course?: CourseData
): string {
  const pod = getPartOfDay();
  const unitName = unit ? getUnitName(unit) : "";
  const courseName = course ? getCourseName(course) : "";
  const videoDesc = unit?.video?.description ?? unit?.video?.voice_text ?? "";
  return text
    .replace(/{{name}}/g, student.name || "champ")
    .replace(/{{partOfDay}}/g, pod)
    .replace(/{{part_of_day}}/g, pod)
    .replace(/{{courseName}}/g, courseName)
    .replace(/{{course_display}}/g, courseName)
    .replace(/{{unitName}}/g, unitName)
    .replace(/{{unit_name}}/g, unitName)
    .replace(/{{courseId}}/g, student.courseId || "")
    .replace(/{{unitId}}/g, unit?.unit_id ?? unit?.id ?? "")
    .replace(/{{videoDescription}}/g, videoDesc)
    .replace(/{{video_description}}/g, videoDesc)
    .replace(/{{nextUnitName}}/g, "");
}

export function stripRenderHints(text: string): { clean: string; hints: string[] } {
  const hints: string[] = [];
  const clean = text.replace(/\[([^\]]+)\]/g, (_, inner) => {
    hints.push(inner);
    return "";
  }).trim();
  return { clean, hints };
}

export function buildStepMap(steps: FlowStep[]): Record<string, FlowStep> {
  const map: Record<string, FlowStep> = {};
  for (const s of steps) {
    map[stepId(s)] = s;
  }
  return map;
}

export function resolvePts(hint: string): number | null {
  const m = hint.match(/^\+?(\d+)\s*pts?$/i);
  return m ? parseInt(m[1], 10) : null;
}
EOF

# ── lib/student-context.tsx ───────────────────────────────────────────────────
cat > lib/student-context.tsx << 'EOF'
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "English" | "Hindi" | "Marathi" | "Punjabi" | "Kannada";
export type CourseId = "science" | "coding" | "financial-verticals" | "visual-arts";

export interface Student {
  name: string;
  phone: string;
  language: Language;
  hasSibling: boolean | null;
  school: string;
  class: string;
  subject: string;
  courseId: CourseId | null;
  selected_course: CourseId | null;
  currentUnitIndex: number;
  points: number;
  onboardingDone: boolean;
}

const DEFAULT: Student = {
  name: "", phone: "", language: "English",
  hasSibling: null, school: "", class: "", subject: "",
  courseId: null, selected_course: null,
  currentUnitIndex: 0, points: 0, onboardingDone: false,
};

interface Ctx {
  student: Student;
  updateStudent: (patch: Partial<Student>) => void;
  addPoints: (pts: number) => void;
  resetStudent: () => void;
}

const StudentContext = createContext<Ctx | null>(null);
const KEY = "tap_student_v2";

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStudent({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const persist = (s: Student) => {
    setStudent(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  };

  return (
    <StudentContext.Provider value={{
      student,
      updateStudent: (patch) => persist({ ...student, ...patch }),
      addPoints: (pts) => persist({ ...student, points: student.points + pts }),
      resetStudent: () => persist(DEFAULT),
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be inside StudentProvider");
  return ctx;
}
EOF

# ── lib/groq.ts ───────────────────────────────────────────────────────────────
cat > lib/groq.ts << 'EOF'
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(userMessage: string, studentName?: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) return "Hey " + (studentName || "champ") + "! Ask me anything 🐝";
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 120,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are TAP Buddy 🐝, a warm and encouraging learning companion for children aged 8–16. The student's name is ${studentName || "champ"}. Keep replies to 2 sentences max. Always use emojis. Be positive and supportive.`,
          },
          { role: "user", content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "You're doing amazing, keep going! 🌟";
  } catch {
    return "You're doing great " + (studentName || "champ") + "! 🌟";
  }
}
EOF

# ── lib/use-auto-audio.ts ─────────────────────────────────────────────────────
cat > lib/use-auto-audio.ts << 'EOF'
"use client";
import { useEffect, useRef, useState } from "react";

export function useAutoAudio(src?: string | null) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const hasAudio = !!src;

  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    ref.current = a;
    a.onended = () => setPlaying(false);
    a.onerror = () => setPlaying(false);
    a.play().then(() => setPlaying(true)).catch(() => {});
    return () => { a.pause(); a.src = ""; };
  }, [src]);

  const replay = () => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => {});
  };

  return { hasAudio, playing, replay };
}
EOF

# ── app/globals.css ───────────────────────────────────────────────────────────
cat > app/globals.css << 'EOF'
@import "tailwindcss";

:root {
  --bg: #F4F4F7;
  --bubble-user: #E7F5EC;
  --bubble-bot: #F0F0F2;
  --bubble-bot-alt: #F7E6E6;
  --primary-from: #5B5BEF;
  --primary-to: #6460F8;
  --text-main: #444444;
  --text-muted: #9AA0A6;
  --border-soft: #E5E5EA;
  --lavender: #E9E7FF;
  --sky: #DCEEFF;
  --mint: #DFF3E5;
  --yellow: #FFE8A3;
}

* { box-sizing: border-box; }

html, body {
  background: var(--bg);
  color: var(--text-main);
  font-family: var(--font-inter), system-ui, sans-serif;
}

h1,h2,h3,h4,.font-display {
  font-family: var(--font-poppins), system-ui, sans-serif;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 8px; }

.btn-primary {
  background: linear-gradient(135deg, var(--primary-from), var(--primary-to));
  color: white;
  border-radius: 16px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(91,91,239,.28);
  transition: transform .15s ease, box-shadow .15s ease;
  cursor: pointer;
}
.btn-primary:active { transform: scale(.97); box-shadow: 0 3px 8px rgba(91,91,239,.24); }
.btn-primary:disabled { opacity: .5; box-shadow: none; cursor: not-allowed; }

.pill-input {
  border-radius: 999px;
  border: 1.5px solid var(--border-soft);
  background: white;
  color: var(--text-main);
  padding: 12px 20px;
}
.pill-input::placeholder { color: var(--text-muted); }
.pill-input:focus { outline: none; border-color: var(--primary-from); box-shadow: 0 0 0 3px rgba(91,91,239,.12); }

.bubble { border-radius: 20px; padding: 14px 18px; max-width: 78%; line-height: 1.5; font-size: 15px; }
.bubble-bot { background: var(--bubble-bot); border-bottom-left-radius: 6px; }
.bubble-bot-alt { background: var(--bubble-bot-alt); border-bottom-left-radius: 6px; }
.bubble-user { background: var(--bubble-user); border-bottom-right-radius: 6px; margin-left: auto; }

.card-float {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,.05);
  border: 1px solid var(--border-soft);
}

.chip {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.option-pill {
  border-radius: 999px;
  border: 1.5px solid var(--border-soft);
  background: white;
  color: var(--primary-from);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
  text-align: left;
}
.option-pill:active { transform: scale(.97); }
.option-pill:hover { border-color: var(--primary-from); background: var(--lavender); }

.replay-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-from);
  margin-top: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

@keyframes pop-in {
  0% { opacity: 0; transform: translateY(8px) scale(.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-pop { animation: pop-in .28s ease-out; }

@keyframes badge-bounce {
  0% { transform: scale(.4) rotate(-8deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.animate-badge { animation: badge-bounce .4s cubic-bezier(.34,1.56,.64,1); }

@keyframes fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
}

@keyframes bounce-dot {
  0%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
.typing-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text-muted);
  display: inline-block;
  animation: bounce-dot 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: .2s; }
.typing-dot:nth-child(3) { animation-delay: .4s; }

@media (prefers-reduced-motion: reduce) {
  .animate-pop,.animate-badge { animation: none; }
}
EOF

# ── app/layout.tsx ────────────────────────────────────────────────────────────
cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/lib/student-context";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = { title: "TAP Buddy 🐝", description: "Your daily learning companion" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <StudentProvider>{children}</StudentProvider>
      </body>
    </html>
  );
}
EOF

# ── app/page.tsx ──────────────────────────────────────────────────────────────
cat > app/page.tsx << 'EOF'
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";

export default function Root() {
  const { student } = useStudent();
  const router = useRouter();
  useEffect(() => {
    router.replace(student.onboardingDone ? "/home" : "/onboarding");
  }, [student.onboardingDone, router]);
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <span className="text-4xl animate-bounce">🐝</span>
    </div>
  );
}
EOF

# ── components/chat/BuddyChip.tsx ─────────────────────────────────────────────
cat > components/chat/BuddyChip.tsx << 'EOF'
"use client";
export function BuddyChip() {
  return (
    <div className="chip" style={{ background: "var(--lavender)", color: "#5B5BEF" }}>
      <span>🐝</span><span>TAP Buddy</span>
    </div>
  );
}
EOF

# ── components/chat/MessageBubble.tsx ─────────────────────────────────────────
cat > components/chat/MessageBubble.tsx << 'EOF'
"use client";
import { useAutoAudio } from "@/lib/use-auto-audio";

type Props = { text: string; variant: "bot" | "bot-alt" | "user"; audioSrc?: string };

export function MessageBubble({ text, variant, audioSrc }: Props) {
  const isUser = variant === "user";
  const cls = variant === "bot-alt" ? "bubble bubble-bot-alt" : isUser ? "bubble bubble-user" : "bubble bubble-bot";
  const { hasAudio, playing, replay } = useAutoAudio(audioSrc || null);
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "var(--lavender)" }}>🐝</div>
      )}
      <div className={cls}>
        <p className="whitespace-pre-line" style={{ color: "var(--text-main)" }}>{text}</p>
        {!isUser && hasAudio && (
          <button className="replay-btn" onClick={replay}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={playing ? "animate-spin" : ""}>
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            {playing ? "Playing…" : "Play again"}
          </button>
        )}
      </div>
    </div>
  );
}
EOF

# ── components/chat/OptionButtons.tsx ────────────────────────────────────────
cat > components/chat/OptionButtons.tsx << 'EOF'
"use client";
import { StepOption } from "@/lib/flow-engine";

type Props = { options: StepOption[]; onSelect: (opt: StepOption) => void; style?: string };

export function OptionButtons({ options, onSelect, style }: Props) {
  const isRadio = style === "radio";
  return (
    <div className={`flex flex-wrap gap-2 pl-10 mt-1 ${isRadio ? "flex-col" : ""}`}>
      {options.map((o, i) => (
        <button key={o.id ?? o.value ?? i} className="option-pill" onClick={() => onSelect(o)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
EOF

# ── components/renders/ConfettiRender.tsx ─────────────────────────────────────
cat > components/renders/ConfettiRender.tsx << 'EOF'
"use client";
import { useEffect, useState } from "react";

export function ConfettiRender() {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);
  useEffect(() => {
    const colors = ["#5B5BEF","#FFE8A3","#DFF3E5","#F7E6E6","#DCEEFF","#E9E7FF","#FF9B9B","#9BF7C4"];
    setPieces(Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.8,
      size: 5 + Math.random() * 7,
    })));
  }, []);
  return (
    <div className="pl-10 relative h-20 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <div key={p.id} className="absolute rounded-sm" style={{
          left: `${p.x}%`, top: 0, width: p.size, height: p.size,
          background: p.color,
          animation: `fall 1.4s ease-in ${p.delay}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}
EOF

# ── components/renders/PtsBadge.tsx ──────────────────────────────────────────
cat > components/renders/PtsBadge.tsx << 'EOF'
"use client";
export function PtsBadge({ pts }: { pts: number }) {
  return (
    <div className="pl-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl animate-badge" style={{ background: "var(--yellow)" }}>
        <span className="text-xl">⭐</span>
        <span className="font-display font-bold text-base" style={{ color: "#7A6000" }}>+{pts} pts</span>
      </div>
    </div>
  );
}
EOF

# ── components/renders/ProfileCardRender.tsx ──────────────────────────────────
cat > components/renders/ProfileCardRender.tsx << 'EOF'
"use client";
import { Student } from "@/lib/student-context";
import { ProfileField } from "@/lib/flow-engine";

type Props = {
  fields: ProfileField[];
  student: Student;
  editing: Record<string, string>;
  answered?: boolean;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
};

export function ProfileCardRender({ fields, student, editing, answered, onChange, onSave }: Props) {
  const val = (f: ProfileField) => editing[f.key] ?? String((student as Record<string,unknown>)[f.key] ?? "");
  const opts = (f: ProfileField) => f.options ?? [];

  if (answered) {
    return (
      <div className="pl-10">
        <div className="card-float p-4 flex flex-col gap-2">
          {fields.map(f => (
            <div key={f.key} className="flex justify-between text-sm">
              <span style={{ color: "var(--text-muted)" }}>{f.label}</span>
              <span className="font-semibold" style={{ color: "var(--text-main)" }}>{val(f) || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        {fields.map(f => {
          const type = f.type ?? f.input_mode ?? "free_text";
          const isSelect = type === "select" && opts(f).length > 0;
          return (
            <div key={f.key}>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
              {isSelect ? (
                <select className="pill-input w-full text-sm" value={val(f)} onChange={e => onChange(f.key, e.target.value)}>
                  <option value="">Select…</option>
                  {opts(f).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={type === "tel" ? "tel" : "text"} className="pill-input w-full text-sm"
                  placeholder={f.placeholder ?? f.label} value={val(f)}
                  onChange={e => onChange(f.key, e.target.value)} />
              )}
            </div>
          );
        })}
        <button className="btn-primary py-2.5 text-sm mt-1" onClick={onSave}>Save ✓</button>
      </div>
    </div>
  );
}
EOF

# ── components/renders/VideoRender.tsx ────────────────────────────────────────
cat > components/renders/VideoRender.tsx << 'EOF'
"use client";
import { useState } from "react";
import { CourseUnit } from "@/lib/flow-engine";

type Props = { content: CourseUnit["video"]; answered?: boolean; onComplete: () => void };

export function VideoRender({ content, answered, onComplete }: Props) {
  const [watched, setWatched] = useState(false);
  const isYT = (content.youtube_url ?? "").includes("youtu");
  const ytId = isYT ? (content.youtube_url ?? "").split(/[/=]/).filter(Boolean).pop() : null;

  return (
    <div className="pl-10">
      <div className="card-float overflow-hidden">
        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
          {isYT && ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setWatched(true)}
            />
          ) : (
            <video src={content.url ?? ""} poster={content.thumbnail} controls
              className="w-full h-full" onEnded={() => setWatched(true)} />
          )}
        </div>
        <div className="p-4">
          <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>{content.title}</p>
          {content.description && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{content.description}</p>}
          {!answered && (
            <button className="btn-primary w-full py-2.5 text-sm mt-3" onClick={onComplete}
              style={{ opacity: watched ? 1 : 0.65 }}>
              {watched ? "✅ Done watching!" : "Mark as watched"}
            </button>
          )}
          {answered && <p className="mt-3 text-sm font-semibold text-center" style={{ color: "#4CAF50" }}>✅ Video completed!</p>}
        </div>
      </div>
    </div>
  );
}
EOF

# ── components/renders/SubmissionRender.tsx ───────────────────────────────────
cat > components/renders/SubmissionRender.tsx << 'EOF'
"use client";
import { useState } from "react";
import { CourseUnit } from "@/lib/flow-engine";

type Props = { content: CourseUnit["submission"]; onSubmit: () => void; submitted?: boolean };

export function SubmissionRender({ content, onSubmit, submitted }: Props) {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("");
  const max = content.maxChars ?? 400;

  if (submitted) {
    return (
      <div className="pl-10">
        <div className="card-float p-4">
          <p className="text-sm font-semibold" style={{ color: "#4CAF50" }}>✅ Submission sent!</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{text.slice(0, 80)}{text.length > 80 ? "…" : ""}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        {content.title && <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>{content.title}</p>}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{content.prompt}</p>
        <textarea className="pill-input w-full text-sm resize-none" style={{ borderRadius: 16, height: 100 }}
          placeholder="Type your answer here…" maxLength={max} value={text} onChange={e => setText(e.target.value)} />
        {content.emoji_options && content.emoji_options.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {content.emoji_options.map(e => (
              <button key={e.emoji} onClick={() => setEmoji(e.emoji)}
                className="px-3 py-1.5 rounded-2xl text-sm border transition-all"
                style={{ borderColor: emoji === e.emoji ? "var(--primary-from)" : "var(--border-soft)", background: emoji === e.emoji ? "var(--lavender)" : "white" }}>
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{text.length}/{max}</span>
          <button className="btn-primary px-5 py-2 text-sm" disabled={!text.trim()} onClick={onSubmit}>Submit 🚀</button>
        </div>
      </div>
    </div>
  );
}
EOF

# ── components/renders/QuizRender.tsx ────────────────────────────────────────
cat > components/renders/QuizRender.tsx << 'EOF'
"use client";
import { useState } from "react";

type QOption = { id?: string; value?: string; label: string };
type QuizQuestion = {
  question?: string;
  options?: QOption[];
  correctId?: string;
  correct_option?: string;
  consolation?: string;
  hint?: string;
  explanation?: string;
};

type Props = { question: QuizQuestion; onAnswer: (correct: boolean) => void };

export function QuizRender({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const correctId = question.correctId ?? question.correct_option ?? "";
  const opts = question.options ?? [];

  const handleSelect = (id: string) => {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
    const correct = id === correctId;
    if (!correct) setShowHint(true);
    setTimeout(() => onAnswer(correct), correct ? 800 : 0);
  };

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>{question.question}</p>
        <div className="flex flex-col gap-2">
          {opts.map((o, i) => {
            const id = o.id ?? o.value ?? String(i);
            const isSelected = selected === id;
            const isCorrect = id === correctId;
            let bg = "white", border = "var(--border-soft)", color = "var(--text-main)";
            if (revealed) {
              if (isCorrect) { bg = "var(--mint)"; border = "#4CAF50"; color = "#2E7D32"; }
              else if (isSelected) { bg = "var(--bubble-bot-alt)"; border = "#E57373"; color = "#C62828"; }
            } else if (isSelected) { bg = "var(--lavender)"; border = "var(--primary-from)"; }
            return (
              <button key={id} onClick={() => handleSelect(id)}
                className="text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all border"
                style={{ background: bg, borderColor: border, color }}>
                {o.label}
              </button>
            );
          })}
        </div>
        {showHint && question.consolation && (
          <div className="rounded-2xl p-3 text-sm" style={{ background: "var(--bubble-bot-alt)" }}>
            <p style={{ color: "var(--text-main)" }}>{question.consolation}</p>
            {question.hint && <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>💡 {question.hint}</p>}
          </div>
        )}
        {showHint && (
          <div className="flex gap-2 flex-wrap">
            <button className="option-pill text-sm px-4 py-2" onClick={() => { setSelected(null); setRevealed(false); setShowHint(false); }}>Try again 🔁</button>
            <button className="option-pill text-sm px-4 py-2" onClick={() => onAnswer(false)}>Next question ➡️</button>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# ── components/renders/ScoreCard.tsx ─────────────────────────────────────────
cat > components/renders/ScoreCard.tsx << 'EOF'
"use client";
type Props = { videoPts: number; submissionPts: number; quizPts: number; total: number };

export function ScoreCard({ videoPts, submissionPts, quizPts, total }: Props) {
  const rows = [
    { label: "🎬 Video", pts: videoPts },
    { label: "📝 Submission", pts: submissionPts },
    { label: "🧠 Quiz", pts: quizPts },
  ];
  return (
    <div className="pl-10">
      <div className="card-float p-5 flex flex-col gap-3" style={{ background: "linear-gradient(135deg, var(--lavender), var(--sky))" }}>
        <p className="font-display font-bold text-sm" style={{ color: "#5B5BEF" }}>Today's Score 🏅</p>
        {rows.map(r => (
          <div key={r.label} className="flex justify-between text-sm">
            <span style={{ color: "var(--text-main)" }}>{r.label}</span>
            <span className="font-bold" style={{ color: "#5B5BEF" }}>+{r.pts} pts</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between" style={{ borderColor: "rgba(91,91,239,.2)" }}>
          <span className="font-display font-bold text-sm" style={{ color: "var(--text-main)" }}>Total</span>
          <span className="font-display font-bold text-lg animate-badge" style={{ color: "#5B5BEF" }}>{total} pts 🏆</span>
        </div>
      </div>
    </div>
  );
}
EOF

# ── components/renders/NextUnitCard.tsx ───────────────────────────────────────
cat > components/renders/NextUnitCard.tsx << 'EOF'
"use client";
import { CourseData, CourseUnit, getUnitName, getCourseName } from "@/lib/flow-engine";

type Props = { unit: CourseUnit | null; course: CourseData | null; onGo: () => void };

export function NextUnitCard({ unit, course, onGo }: Props) {
  if (!unit) {
    return (
      <div className="pl-10">
        <div className="card-float p-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>You've completed all units!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{course?.emoji ?? "📚"}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>UP NEXT — {course ? getCourseName(course) : ""}</p>
            <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>{getUnitName(unit)}</p>
          </div>
        </div>
        <button className="btn-primary py-2.5 text-sm" onClick={onGo}>📚 Start {getUnitName(unit)}</button>
      </div>
    </div>
  );
}
EOF

# ── components/shared/BottomNav.tsx ──────────────────────────────────────────
cat > components/shared/BottomNav.tsx << 'EOF'
"use client";
import { useRouter } from "next/navigation";

type Tab = "home" | "chat" | "passport";
const TABS = [
  { id: "home" as Tab, label: "Home", emoji: "🏠", route: "/home" },
  { id: "chat" as Tab, label: "Learn", emoji: "🐝", route: "/chat" },
  { id: "passport" as Tab, label: "Passport", emoji: "🗂️", route: "/passport" },
];

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 px-4 z-20"
      style={{ background: "white", borderTop: "1px solid var(--border-soft)" }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => router.push(t.route)}
          className="flex flex-col items-center gap-0.5 min-w-[60px]"
          style={{ color: active === t.id ? "var(--primary-from)" : "var(--text-muted)" }}>
          <span className="text-xl">{t.emoji}</span>
          <span className="text-xs font-semibold">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
EOF

# ── app/onboarding/page.tsx ───────────────────────────────────────────────────
cat > app/onboarding/page.tsx << 'ENDOFFILE'
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import {
  buildStepMap, interpolate, stripRenderHints, resolvePts,
  stepId, stepNext, stepAudio, stepText, stepInputMode, stepOptions,
  FlowStep, FlowData, StepOption,
} from "@/lib/flow-engine";
import { BuddyChip } from "@/components/chat/BuddyChip";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OptionButtons } from "@/components/chat/OptionButtons";
import { ProfileCardRender } from "@/components/renders/ProfileCardRender";
import { PtsBadge } from "@/components/renders/PtsBadge";
import { ConfettiRender } from "@/components/renders/ConfettiRender";

interface Msg {
  key: string;
  stepId: string;
  from: "buddy" | "user";
  text: string;
  audioSrc?: string;
  renderHints?: string[];
  options?: StepOption[];
  fields?: FlowStep["fields"] | FlowStep["form_fields"];
  subFields?: FlowStep["sub_display"];
  style?: string;
  answered?: boolean;
  ptsAwarded?: number;
}

export default function OnboardingPage() {
  const { student, updateStudent, addPoints } = useStudent();
  const router = useRouter();
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [stepMap, setStepMap] = useState<Record<string, FlowStep>>({});
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentId, setCurrentId] = useState("OB-01");
  const [history, setHistory] = useState<string[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [freeInputStep, setFreeInputStep] = useState<{ stepId: string; next: string | null } | null>(null);
  const [freeText, setFreeText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const processed = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch("/data/onboarding.json").then(r => r.json()).then((d: FlowData) => {
      setFlow(d);
      setStepMap(buildStepMap(d.steps));
    });
  }, []);

  const markAnswered = useCallback((key: string) => {
    setMessages(prev => prev.map(m => m.key === key ? { ...m, answered: true } : m));
  }, []);

  const advance = useCallback((nextId: string | null) => {
    if (!nextId) return;
    setHistory(h => [...h, currentId]);
    setCurrentId(nextId);
  }, [currentId]);

  const pushMsg = useCallback((msg: Omit<Msg, "key">) => {
    const key = `${msg.stepId}-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { ...msg, key }]);
    return key;
  }, []);

  useEffect(() => {
    if (!flow || !stepMap[currentId]) return;
    const sid = currentId;
    if (processed.current.has(sid)) return;
    processed.current.add(sid);

    const step = stepMap[sid];
    const mode = stepInputMode(step);
    const rawText = stepText(step);
    const { clean, hints } = stripRenderHints(interpolate(rawText, student));
    const audio = stepAudio(step);
    const opts = stepOptions(step);

    const ptsHint = hints.find(h => resolvePts(h) !== null);
    const ptsVal = ptsHint ? resolvePts(ptsHint)! : (step.points_awarded ?? 0);

    const hasVariants = !!step.variants;
    let displayText = clean;
    let variantAudio = audio;

    if (hasVariants && step.variants) {
      const courseKey = student.selected_course ?? student.courseId ?? "";
      const v = step.variants[courseKey];
      if (v) {
        const { clean: vc } = stripRenderHints(interpolate(v.display_text, student));
        displayText = vc;
        variantAudio = (step as Record<string,unknown>)[`audio_${courseKey}`] as string ?? audio;
      }
    }

    if (mode === "free_text") {
      pushMsg({ stepId: sid, from: "buddy", text: displayText, audioSrc: audio || undefined });
      setFreeInputStep({ stepId: sid, next: stepNext(step) });
      return;
    }

    const key = pushMsg({
      stepId: sid,
      from: "buddy",
      text: displayText,
      audioSrc: variantAudio || undefined,
      renderHints: hints,
      ptsAwarded: ptsVal,
      fields: step.form_fields ?? step.fields,
      subFields: step.sub_display,
      options: mode === "buttons_only" || mode === "radio" ? opts : undefined,
      style: mode === "radio" ? "radio" : undefined,
    });

    if (ptsVal > 0) addPoints(ptsVal);

    if (mode === "static") {
      const delay = step.delayMs ?? step.delay_after_submit_ms ?? 800;
      const next = stepNext(step);
      if (next) setTimeout(() => advance(next), delay);
    }

    if (mode === "form") {
      void key;
    }
  }, [currentId, stepMap, flow]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOption = useCallback((msgKey: string, stepSid: string, opt: StepOption) => {
    markAnswered(msgKey);
    pushMsg({ stepId: "user", from: "user", text: opt.label });

    const step = stepMap[stepSid];
    const nextFromOpt = opt.next_step ?? opt.next;
    const cacheKey = step?.cache_fields?.[0];

    if (cacheKey === "selected_course" || cacheKey === "language" || cacheKey === "has_sibling") {
      const val = opt.value ?? opt.id ?? "";
      if (cacheKey === "selected_course") updateStudent({ selected_course: val as never, courseId: val as never });
      else if (cacheKey === "language") updateStudent({ language: val as never });
      else if (cacheKey === "has_sibling") updateStudent({ hasSibling: val === "yes" });
    }

    if (nextFromOpt) setTimeout(() => advance(nextFromOpt), 400);
  }, [stepMap, markAnswered, pushMsg, updateStudent, advance]);

  const handleFormSave = useCallback((msgKey: string, stepSid: string) => {
    markAnswered(msgKey);
    const patch: Record<string, string> = {};
    const step = stepMap[stepSid];
    const fields = step.form_fields ?? step.fields ?? [];
    fields.forEach(f => { if (editing[f.key] !== undefined) patch[f.key] = editing[f.key]; });
    if (Object.keys(patch).length > 0) updateStudent(patch as never);
    setEditing({});
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), 400);
  }, [stepMap, editing, markAnswered, updateStudent, advance]);

  const handleProfileConfirm = useCallback((msgKey: string, stepSid: string, opt: StepOption) => {
    if (opt.value === "edit" || opt.id === "edit") {
      const next = opt.next_step ?? opt.next;
      markAnswered(msgKey);
      pushMsg({ stepId: "user", from: "user", text: opt.label });
      if (next) setTimeout(() => advance(next), 400);
    } else {
      handleOption(msgKey, stepSid, opt);
    }
  }, [markAnswered, pushMsg, advance, handleOption]);

  const handleFreeTextSend = useCallback(() => {
    if (!freeInputStep || !freeText.trim()) return;
    const { stepId: sid, next } = freeInputStep;
    const step = stepMap[sid];
    const cacheFields = step?.cache_fields ?? [];
    if (cacheFields.includes("name")) updateStudent({ name: freeText.trim() });
    if (cacheFields.includes("phone")) updateStudent({ phone: freeText.trim() });
    pushMsg({ stepId: "user", from: "user", text: freeText.trim() });
    setFreeText("");
    setFreeInputStep(null);
    if (next) setTimeout(() => advance(next), 400);
  }, [freeInputStep, freeText, stepMap, updateStudent, pushMsg, advance]);

  const handleCTA = useCallback((opt: StepOption) => {
    if (opt.value === "start_learning" || opt.id === "start") {
      updateStudent({ onboardingDone: true });
      router.push("/home");
    } else {
      const next = opt.next_step ?? opt.next;
      if (next) advance(next);
      if (opt.route) router.push(opt.route);
    }
  }, [updateStudent, router, advance]);

  const isLastStep = currentId === "OB-09" && messages.some(m => m.stepId === "OB-09");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10" style={{ background: "var(--bg)" }}>
        <BuddyChip />
        {history.length > 0 && (
          <button className="ml-auto text-sm font-semibold" style={{ color: "var(--text-muted)" }}
            onClick={() => {
              const prev = history[history.length - 1];
              setHistory(h => h.slice(0, -1));
              setMessages(prev2 => {
                const idx = [...prev2].reverse().findIndex(m => m.stepId === prev);
                if (idx === -1) return prev2;
                return prev2.slice(0, prev2.length - idx - 1);
              });
              processed.current.delete(currentId);
              setCurrentId(prev);
            }}>
            ← Back
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col gap-4 pb-32">
        {messages.map(msg => (
          <div key={msg.key} className="animate-pop">
            {msg.from === "user" ? (
              <MessageBubble variant="user" text={msg.text} />
            ) : (
              <div className="flex flex-col gap-2">
                {msg.text && <MessageBubble variant="bot" text={msg.text} audioSrc={msg.audioSrc} />}

                {msg.renderHints?.includes("confetti") && <ConfettiRender />}

                {msg.ptsAwarded && msg.ptsAwarded > 0 && msg.renderHints?.some(h => resolvePts(h) !== null) && (
                  <PtsBadge pts={msg.ptsAwarded} />
                )}

                {msg.subFields && (
                  <div className="pl-10">
                    <div className="card-float p-4 flex flex-col gap-2">
                      {msg.subFields.fields.map(f => (
                        <div key={f.key} className="flex justify-between text-sm">
                          <span style={{ color: "var(--text-muted)" }}>{f.label}</span>
                          <span className="font-semibold" style={{ color: "var(--text-main)" }}>
                            {String((student as Record<string,unknown>)[f.key] ?? "—")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!msg.answered && msg.fields && (stepMap[msg.stepId]?.input_mode === "form" || stepMap[msg.stepId]?.type === "profile-card") && (
                  <ProfileCardRender
                    fields={msg.fields}
                    student={student}
                    editing={editing}
                    answered={msg.answered}
                    onChange={(k, v) => setEditing(e => ({ ...e, [k]: v }))}
                    onSave={() => handleFormSave(msg.key, msg.stepId)}
                  />
                )}

                {!msg.answered && msg.options && msg.stepId !== "OB-09" && !msg.subFields && (
                  <OptionButtons options={msg.options} style={msg.style}
                    onSelect={opt => handleOption(msg.key, msg.stepId, opt)} />
                )}

                {!msg.answered && msg.subFields && msg.options && (
                  <OptionButtons options={msg.options}
                    onSelect={opt => handleProfileConfirm(msg.key, msg.stepId, opt)} />
                )}

                {!msg.answered && msg.stepId === "OB-09" && msg.options && (
                  <div className="flex flex-wrap gap-2 pl-10 mt-1">
                    {msg.options.map((o, i) => (
                      <button key={i} className="btn-primary px-6 py-3 text-sm" onClick={() => handleCTA(o)}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {freeInputStep && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 z-20"
          style={{ background: "white", borderTop: "1px solid var(--border-soft)" }}>
          <div className="flex gap-2">
            <input className="pill-input flex-1 text-sm" placeholder="Type here…"
              value={freeText} onChange={e => setFreeText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFreeTextSend()} autoFocus />
            <button className="btn-primary px-4 py-2 text-sm" disabled={!freeText.trim()}
              onClick={handleFreeTextSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
ENDOFFILE

# ── app/chat/page.tsx ─────────────────────────────────────────────────────────
cat > app/chat/page.tsx << 'ENDOFFILE'
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import {
  buildStepMap, interpolate, stripRenderHints, resolvePts,
  stepId, stepNext, stepAudio, stepText, stepInputMode, stepOptions,
  getUnitName, getCourseName, getUnitQuestions,
  FlowStep, FlowData, CourseData, CourseUnit, StepOption, getPartOfDay,
} from "@/lib/flow-engine";
import { askGroq } from "@/lib/groq";
import { BuddyChip } from "@/components/chat/BuddyChip";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OptionButtons } from "@/components/chat/OptionButtons";
import { PtsBadge } from "@/components/renders/PtsBadge";
import { VideoRender } from "@/components/renders/VideoRender";
import { SubmissionRender } from "@/components/renders/SubmissionRender";
import { QuizRender } from "@/components/renders/QuizRender";
import { ScoreCard } from "@/components/renders/ScoreCard";
import { NextUnitCard } from "@/components/renders/NextUnitCard";
import { BottomNav } from "@/components/shared/BottomNav";

interface Msg {
  key: string;
  stepId: string;
  from: "buddy" | "user";
  text: string;
  audioSrc?: string;
  renderHints?: string[];
  options?: StepOption[];
  actions?: StepOption[];
  answered?: boolean;
  ptsAwarded?: number;
  dynamicType?: "video" | "submission" | "quiz" | "score" | "next-unit";
  quizQuestion?: ReturnType<typeof getUnitQuestions>[number];
  quizStepId?: string;
}

export default function ChatPage() {
  const { student, addPoints, updateStudent } = useStudent();
  const router = useRouter();
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [stepMap, setStepMap] = useState<Record<string, FlowStep>>({});
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentId, setCurrentId] = useState("DA-01");
  const [sessionPts, setSessionPts] = useState(0);
  const [freeInput, setFreeInput] = useState("");
  const [freeLoading, setFreeLoading] = useState(false);
  const [showFreeInput, setShowFreeInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const processed = useRef<Set<string>>(new Set());
  const videoPts = useRef(0);
  const submissionPts = useRef(0);
  const quizPts = useRef(0);

  useEffect(() => {
    const courseId = student.courseId ?? student.selected_course;
    if (!courseId) return;
    const courseFile = courseId === "financial-verticals" ? "financial-vertical" : courseId;
    Promise.all([
      fetch("/data/activity.json").then(r => r.json()),
      fetch(`/data/course/${courseFile}.json`).then(r => r.json()),
    ]).then(([act, crs]: [FlowData, CourseData]) => {
      setFlow(act);
      setStepMap(buildStepMap(act.steps));
      setCourse(crs);
      setUnit(crs.units[student.currentUnitIndex ?? 0] ?? crs.units[0]);
    });
  }, [student.courseId, student.selected_course, student.currentUnitIndex]);

  const award = useCallback((pts: number) => {
    addPoints(pts);
    setSessionPts(p => p + pts);
  }, [addPoints]);

  const advance = useCallback((nextId: string | null) => {
    if (!nextId) { setShowFreeInput(true); return; }
    setCurrentId(nextId);
  }, []);

  const pushMsg = useCallback((msg: Omit<Msg, "key">) => {
    const key = `${msg.stepId}-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { ...msg, key }]);
    return key;
  }, []);

  useEffect(() => {
    if (!flow || !stepMap[currentId] || !unit) return;
    const sid = currentId;
    if (processed.current.has(sid)) return;
    processed.current.add(sid);

    const step = stepMap[sid];
    const mode = stepInputMode(step);
    const rawText = stepText(step);
    const { clean, hints } = stripRenderHints(interpolate(rawText, student, unit, course ?? undefined));
    const audio = stepAudio(step);
    const opts = stepOptions(step);
    const ptsHint = hints.find(h => resolvePts(h) !== null);
    const ptsVal = ptsHint ? resolvePts(ptsHint)! : (step.points_awarded ?? step.pts ?? 0);

    if (step.type === "dynamic" || (mode === "static" && hints.some(h => h.startsWith("video-") || h.startsWith("submission-") || h.startsWith("quiz-") || h === "champ-score"))) {
      const renderKey = step.content_ref?.render_key as string ?? hints[0] ?? "";
      if (renderKey.startsWith("video") || step.content_ref?.component === "VideoPlayer") {
        pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "video" });
        return;
      }
      if (renderKey.startsWith("submission") || step.content_ref?.component === "SubmissionCard") {
        pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "submission" });
        return;
      }
      if (renderKey.startsWith("quiz") || step.content_ref?.component === "QuizQuestion" || step.content_ref?.component === "QuizFeedback") {
        const qIdx = (step.question_number ?? 1) - 1;
        const questions = getUnitQuestions(unit);
        const q = questions[qIdx] ?? null;
        if (q) {
          pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "quiz", quizQuestion: q, quizStepId: sid });
          return;
        }
      }
      if (renderKey === "champ-score" || step.content_ref?.component === "ScoreSummary") {
        pushMsg({ stepId: sid, from: "buddy", text: clean, dynamicType: "score" });
        const next = stepNext(step);
        if (next) setTimeout(() => advance(next), 800);
        return;
      }
      if (step.content_ref?.component === "UnitPreviewCard") {
        pushMsg({ stepId: sid, from: "buddy", text: clean, dynamicType: "next-unit" });
        return;
      }
    }

    if (mode === "buttons_only" || mode === "radio") {
      pushMsg({ stepId: sid, from: "buddy", text: clean, audioSrc: audio || undefined, options: opts });
      return;
    }

    if (mode === "static") {
      pushMsg({ stepId: sid, from: "buddy", text: clean, audioSrc: audio || undefined, ptsAwarded: ptsVal });
      if (ptsVal > 0) {
        award(ptsVal);
        if (sid === "DA-05" || hints.some(h => h.includes("10"))) videoPts.current += ptsVal;
        else if (sid === "DA-08" || hints.some(h => h.includes("25"))) submissionPts.current += ptsVal;
      }
      const delay = step.delayMs ?? step.delay_after_submit_ms ?? 800;
      const next = stepNext(step);
      if (next) setTimeout(() => advance(next), delay);
    }
  }, [currentId, stepMap, flow, unit, course]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOption = useCallback((msgKey: string, stepSid: string, opt: StepOption) => {
    setMessages(prev => prev.map(m => m.key === msgKey ? { ...m, answered: true } : m));
    pushMsg({ stepId: "user", from: "user", text: opt.label });
    const next = opt.next_step ?? opt.next;
    if (next) setTimeout(() => advance(next), 400);
    if (opt.value === "later" || opt.id === "later") { router.push("/home"); return; }
    if (opt.value === "continue" || opt.id === "next-unit") {
      updateStudent({ currentUnitIndex: (student.currentUnitIndex ?? 0) + 1 });
    }
    if (opt.route) router.push(opt.route);
  }, [pushMsg, advance, router, updateStudent, student.currentUnitIndex]);

  const handleVideoComplete = useCallback((msgKey: string, stepSid: string) => {
    setMessages(prev => prev.map(m => m.key === msgKey ? { ...m, answered: true } : m));
    const step = stepMap[stepSid];
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), 400);
  }, [stepMap, advance]);

  const handleSubmit = useCallback((msgKey: string, stepSid: string) => {
    setMessages(prev => prev.map(m => m.key === msgKey ? { ...m, answered: true } : m));
    const step = stepMap[stepSid];
    const delay = step.delay_after_submit_ms ?? 10000;
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), delay);
  }, [stepMap, advance]);

  const handleQuizAnswer = useCallback((msgKey: string, stepSid: string, correct: boolean) => {
    setMessages(prev => prev.map(m => m.key === msgKey ? { ...m, answered: true } : m));
    const step = stepMap[stepSid];
    if (correct) {
      const pts = step.on_correct ? 15 : (step.onCorrect?.pts ?? 15);
      award(pts);
      quizPts.current += pts;
      const next = step.on_correct?.next_step ?? step.onCorrect?.next;
      if (next) setTimeout(() => advance(next), 400);
    } else {
      const next = step.on_wrong?.next_step ?? step.onWrong?.next;
      if (next) setTimeout(() => advance(next), 400);
    }
  }, [stepMap, advance, award]);

  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = freeInput.trim();
    if (!text) return;
    setFreeInput("");
    pushMsg({ stepId: "user-free", from: "user", text });
    setFreeLoading(true);
    const reply = await askGroq(text, student.name);
    setFreeLoading(false);
    pushMsg({ stepId: "buddy-free", from: "buddy", text: reply });
  };

  const nextUnit = course ? (course.units[(student.currentUnitIndex ?? 0) + 1] ?? null) : null;
  const isEnd = currentId === "DA-END" || showFreeInput;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10" style={{ background: "var(--bg)" }}>
        <button onClick={() => router.push("/home")} className="text-xl" style={{ color: "var(--text-muted)" }}>←</button>
        <BuddyChip />
        <div className="ml-1">
          <p className="font-display font-semibold text-sm" style={{ color: "var(--text-main)" }}>TAP Buddy</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {getPartOfDay()} · {unit ? getUnitName(unit) : ""}
          </p>
        </div>
        <div className="ml-auto chip" style={{ background: "var(--yellow)", color: "#7A6000" }}>
          🏅 {student.points} pts
        </div>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col gap-4 pb-40">
        {messages.map(msg => (
          <div key={msg.key} className="animate-pop">
            {msg.from === "user" ? (
              <MessageBubble variant="user" text={msg.text} />
            ) : (
              <div className="flex flex-col gap-2">
                {msg.text && <MessageBubble variant="bot" text={msg.text} audioSrc={msg.audioSrc} />}

                {msg.ptsAwarded && msg.ptsAwarded > 0 && <PtsBadge pts={msg.ptsAwarded} />}

                {msg.dynamicType === "video" && unit && (
                  <VideoRender content={unit.video} answered={msg.answered}
                    onComplete={() => handleVideoComplete(msg.key, msg.stepId)} />
                )}

                {msg.dynamicType === "submission" && unit && (
                  <SubmissionRender content={unit.submission} submitted={msg.answered}
                    onSubmit={() => handleSubmit(msg.key, msg.stepId)} />
                )}

                {msg.dynamicType === "quiz" && msg.quizQuestion && !msg.answered && (
                  <QuizRender question={msg.quizQuestion}
                    onAnswer={correct => handleQuizAnswer(msg.key, msg.stepId, correct)} />
                )}

                {msg.dynamicType === "score" && (
                  <ScoreCard videoPts={videoPts.current} submissionPts={submissionPts.current}
                    quizPts={quizPts.current} total={sessionPts} />
                )}

                {msg.dynamicType === "next-unit" && (
                  <NextUnitCard unit={nextUnit} course={course}
                    onGo={() => { updateStudent({ currentUnitIndex: (student.currentUnitIndex ?? 0) + 1 }); router.push("/home"); }} />
                )}

                {!msg.answered && msg.options && (
                  <OptionButtons options={msg.options} onSelect={opt => handleOption(msg.key, msg.stepId, opt)} />
                )}
              </div>
            )}
          </div>
        ))}

        {freeLoading && (
          <div className="flex items-end gap-2 animate-pop">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "var(--lavender)" }}>🐝</div>
            <div className="bubble bubble-bot flex gap-1 items-center">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isEnd && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 z-10">
          <form onSubmit={handleFreeInput} className="flex gap-2 card-float p-3">
            <input value={freeInput} onChange={e => setFreeInput(e.target.value)}
              placeholder="Ask TAP Buddy anything… 🐝" className="pill-input flex-1 text-sm" />
            <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={!freeInput.trim()}>Send</button>
          </form>
        </div>
      )}

      <BottomNav active="chat" />
    </div>
  );
}
ENDOFFILE

# ── app/home/page.tsx ─────────────────────────────────────────────────────────
cat > app/home/page.tsx << 'ENDOFFILE'
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import { CourseData, getUnitName, getCourseName } from "@/lib/flow-engine";
import { BottomNav } from "@/components/shared/BottomNav";

export default function HomePage() {
  const { student } = useStudent();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    const courseId = student.courseId ?? student.selected_course;
    if (!courseId) return;
    const file = courseId === "financial-verticals" ? "financial-vertical" : courseId;
    fetch(`/data/course/${file}.json`).then(r => r.json()).then(setCourse);
  }, [student.courseId, student.selected_course]);

  const unit = course?.units[student.currentUnitIndex ?? 0];

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <div className="px-5 pt-6 pb-2">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Welcome back</p>
        <h1 className="font-display font-bold text-2xl mt-0.5" style={{ color: "var(--text-main)" }}>
          {student.name || "Champ"} 👋
        </h1>
      </div>

      <div className="px-4 mt-3">
        <div className="card-float p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: "var(--yellow)" }}>🏅</div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Your Points</p>
            <p className="font-display font-bold text-xl" style={{ color: "var(--text-main)" }}>{student.points} pts</p>
          </div>
        </div>
      </div>

      {course && unit && (
        <div className="px-4 mt-4">
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: "var(--text-muted)" }}>TODAY'S LESSON</p>
          <div className="card-float p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{course.emoji ?? "📚"}</span>
              <div>
                <p className="font-display font-semibold text-base" style={{ color: "var(--text-main)" }}>{getUnitName(unit)}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{getCourseName(course)} · Unit {unit.unit_index !== undefined ? unit.unit_index + 1 : unit.unitNumber}</p>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{unit.description ?? ""}</p>
            <button className="btn-primary w-full py-3 text-sm" onClick={() => router.push("/chat")}>
              🚀 Start Today's Lesson
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-4">
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "var(--lavender)" }}>
          <span className="text-2xl">🐝</span>
          <p className="text-sm font-medium" style={{ color: "#5B5BEF" }}>
            TAP Buddy is here every day. Let's keep that streak going!
          </p>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
ENDOFFILE

# ── app/passport/page.tsx ─────────────────────────────────────────────────────
cat > app/passport/page.tsx << 'ENDOFFILE'
"use client";
import { useStudent } from "@/lib/student-context";
import { BottomNav } from "@/components/shared/BottomNav";

export default function PassportPage() {
  const { student } = useStudent();

  const badges = [
    { id: "enrolled", label: "Enrolled!", emoji: "🎓", earned: !!(student.courseId ?? student.selected_course) },
    { id: "first500", label: "500 Club", emoji: "🏅", earned: student.points >= 500 },
    { id: "first-video", label: "First Video", emoji: "🎬", earned: student.points > 10 },
    { id: "quizzer", label: "Quiz Taker", emoji: "🧠", earned: student.points >= 80 },
    { id: "streak", label: "On a Roll", emoji: "🔥", earned: student.points >= 200 },
    { id: "champ", label: "Top Champ", emoji: "🏆", earned: student.points >= 1000 },
  ];

  const courseLabel = (student.courseId ?? student.selected_course ?? "").replace("-", " ") || "No course yet";

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-main)" }}>Your Passport 🗂️</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>All your achievements in one place</p>
      </div>

      <div className="px-4 mb-4">
        <div className="card-float p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "var(--lavender)" }}>🐝</div>
          <div>
            <p className="font-display font-bold text-lg" style={{ color: "var(--text-main)" }}>{student.name || "Champ"}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{student.school || "TAP Student"}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="chip" style={{ background: "var(--lavender)", color: "#5B5BEF" }}>{student.points} pts</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{courseLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <p className="text-xs font-semibold mb-3 px-1" style={{ color: "var(--text-muted)" }}>BADGES</p>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(b => (
            <div key={b.id} className="card-float p-4 flex flex-col items-center gap-2" style={{ opacity: b.earned ? 1 : 0.4 }}>
              <span className={`text-3xl ${b.earned ? "animate-badge" : ""}`}>{b.emoji}</span>
              <p className="text-xs font-semibold text-center" style={{ color: "var(--text-main)" }}>{b.label}</p>
              {!b.earned && <span className="chip text-xs" style={{ background: "var(--border-soft)", color: "var(--text-muted)" }}>Locked</span>}
            </div>
          ))}
        </div>
      </div>

      {student.school && (
        <div className="px-4 mt-4">
          <div className="card-float p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>PROFILE</p>
            {[
              { label: "School", val: student.school },
              { label: "Class", val: student.class },
              { label: "Subject", val: student.subject },
              { label: "Language", val: student.language },
            ].filter(r => r.val).map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
                <span className="font-semibold" style={{ color: "var(--text-main)" }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav active="passport" />
    </div>
  );
}
ENDOFFILE

# ── DONE ──────────────────────────────────────────────────────────────────────
echo ""
echo "✅ All files written. Structure:"
find app components lib -type f | grep -v node_modules | grep -v ".next" | sort
echo ""
echo "Next steps:"
echo "  1. Add NEXT_PUBLIC_GROQ_API_KEY= to .env.local"
echo "  2. npm install"
echo "  3. npm run dev"
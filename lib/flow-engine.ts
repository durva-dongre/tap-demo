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

/**
 * FIX: Steps can be revisited (e.g. OB-02 after tapping "re-pick" on OB-03).
 * Using the bare step id as the "already processed" key means a step can only
 * ever render once per page session, which silently breaks any flow that
 * loops back to an earlier step via next_step (as opposed to back/goBack).
 *
 * A "visit key" combines the step id with a monotonically increasing visit
 * counter, so every time you *arrive* at a step (forward nav, loop-back, or
 * back nav) it gets a fresh identity and is guaranteed to re-render and
 * re-trigger its audio/effects.
 */
export function makeVisitKey(sid: string, visitIndex: number): string {
  return `${sid}::${visitIndex}`;
}
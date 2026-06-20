export const AUDIO_BASE = "/data/audio";

export function onboardingAudio(stepId: string, courseId?: string | null): string {
  if (stepId === "OB-03" && courseId) {
    return `${AUDIO_BASE}/onboarding/OB-03-${courseId}.mp3`;
  }
  return `${AUDIO_BASE}/onboarding/${stepId}.mp3`;
}

export function dailyActivityAudio(stepId: string): string {
  return `${AUDIO_BASE}/daily-activity/${stepId}.mp3`;
}

export function skipWarningAudio(): string {
  return `${AUDIO_BASE}/daily-activity/DA-04-skip-warning.mp3`;
}

const COURSE_FOLDER: Record<string, string> = {
  science: "science",
  coding: "coding",
  "financial-verticals": "financial-verticals",
  "visual-arts": "visual-arts",
};

export function courseUnitAudio(courseId: string, unitId: string, kind: "video" | "submission"): string {
  const folder = COURSE_FOLDER[courseId] ?? courseId;
  if (courseId === "visual-arts") {
    return `${AUDIO_BASE}/${folder}/${kind}_${unitId}.mp3`;
  }
  return `${AUDIO_BASE}/${folder}/${unitId}-${kind}.mp3`;
}

export function quizQuestionAudio(
  courseId: string,
  unitId: string,
  qIndex: number,
  kind: "" | "consolation" | "explanation" | "hint" = ""
): string {
  const folder = COURSE_FOLDER[courseId] ?? courseId;
  const qn = qIndex + 1;
  if (courseId === "visual-arts") {
    const suffix = kind ? `_${kind}` : "";
    return `${AUDIO_BASE}/${folder}/quiz_${unitId}_q${qn}${suffix}.mp3`;
  }
  const suffix = kind ? `-${kind}` : "";
  return `${AUDIO_BASE}/${folder}/${unitId}-quiz-q${qn}${suffix}.mp3`;
}

export function confettiAudio(): string {
  return `${AUDIO_BASE}/confetti.mp3`;
}

export function tikTikAudio(): string {
  return `${AUDIO_BASE}/tik-tik.mp3`;
}
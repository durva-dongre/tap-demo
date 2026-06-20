"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import {
  buildStepMap, interpolate, stripRenderHints, resolvePts,
  stepNext, stepText, stepInputMode, stepOptions, makeVisitKey,
  getUnitName, getUnitQuestions,
  FlowStep, FlowData, CourseData, CourseUnit, StepOption, getPartOfDay,
} from "@/lib/flow-engine";
import { dailyActivityAudio, quizQuestionAudio, courseUnitAudio, tikTikAudio } from "@/lib/audio-paths";
import { useAudioQueue } from "@/lib/use-audio-queue";
import { askGroq } from "@/lib/groq";
import { AppHeader } from "../../components/shared/Appheader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OptionButtons } from "@/components/chat/OptionButtons";
import { PtsBadge } from "@/components/renders/PtsBadge";
import { VideoRender } from "@/components/renders/VideoRender";
import { SubmissionRender } from "@/components/renders/SubmissionRender";
import { QuizRender } from "@/components/renders/QuizRender";
import { ScoreCard } from "@/components/renders/ScoreCard";
import { NextUnitCard } from "@/components/renders/NextUnitCard";
import { BottomNav } from "@/components/shared/BottomNav";
import { Send, BookOpen, Layers } from "lucide-react";

interface Msg {
  key: string;
  stepId: string;
  from: "buddy" | "user";
  text: string;
  audioSrc?: string;
  renderHints?: string[];
  options?: StepOption[];
  answered?: boolean;
  ptsAwarded?: number;
  dynamicType?: "video" | "submission" | "quiz" | "quiz-wrong" | "score" | "next-unit";
  quizQuestion?: ReturnType<typeof getUnitQuestions>[number];
  quizStepId?: string;
  audioGate?: boolean;
  quizAudioSrc?: string;
  videoAutoplay?: boolean;
}

interface HistoryEntry {
  stepId: string;
  snapshotLen: number;
}

function quizIndexFromStepId(sid: string): number | null {
  const m = sid.match(/^DA-QUIZ-(\d)/);
  if (!m) return null;
  return parseInt(m[1], 10) - 1;
}

function isWrongStep(sid: string): boolean {
  return /^DA-QUIZ-\d-WRONG$/.test(sid);
}

function playOneShot(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionPts, setSessionPts] = useState(0);
  const [freeInput, setFreeInput] = useState("");
  const [freeLoading, setFreeLoading] = useState(false);
  const [showFreeInput, setShowFreeInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const tikTikRef = useRef<HTMLAudioElement | null>(null);

  const { enqueue, replay, skip, pause, resume, activeKey } = useAudioQueue();

  const visitCounters = useRef<Record<string, number>>({});
  const lastProcessedVisitKey = useRef<string | null>(null);

  const pendingAdvance = useRef<string | null>(null);
  const videoPts = useRef(0);
  const submissionPts = useRef(0);
  const quizPts = useRef(0);

  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.src = tikTikAudio();
    tikTikRef.current = a;
    return () => { a.pause(); a.src = ""; };
  }, []);

  const startTikTik = useCallback(() => {
    const a = tikTikRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);

  const stopTikTik = useCallback(() => {
    const a = tikTikRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

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
    setHistory(h => [...h, { stepId: currentId, snapshotLen: messages.length }]);
    visitCounters.current[nextId] = (visitCounters.current[nextId] ?? 0) + 1;
    setCurrentId(nextId);
  }, [currentId, messages.length]);

  const pushMsg = useCallback((msg: Omit<Msg, "key">) => {
    const key = `${msg.stepId}-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { ...msg, key }]);
    return key;
  }, []);

  useEffect(() => {
    if (!flow || !stepMap[currentId] || !unit) return;
    const sid = currentId;
    const courseId = (student.courseId ?? student.selected_course ?? "") as string;
    const unitId = unit.unit_id ?? unit.id ?? "";

    if (visitCounters.current[sid] === undefined) visitCounters.current[sid] = 1;
    const visitIndex = visitCounters.current[sid];
    const visitKey = makeVisitKey(sid, visitIndex);
    if (lastProcessedVisitKey.current === visitKey) return;
    lastProcessedVisitKey.current = visitKey;

    const step = stepMap[sid];
    const mode = stepInputMode(step);
    const rawText = stepText(step);
    const { clean, hints } = stripRenderHints(interpolate(rawText, student, unit, course ?? undefined));
    const opts = stepOptions(step);
    const ptsHint = hints.find(h => resolvePts(h) !== null);
    const ptsVal = ptsHint ? resolvePts(ptsHint)! : (step.points_awarded ?? step.pts ?? 0);

    const isDynamic =
      step.type === "dynamic" ||
      (mode === "static" && hints.some(h => h.startsWith("video-") || h.startsWith("submission-") || h.startsWith("quiz-") || h === "champ-score" || h === "next-unit"));

    if (isDynamic) {
      const renderKey = (step.content_ref?.render_key as string) ?? hints[0] ?? "";
      const component = step.content_ref?.component as string | undefined;

      if (renderKey.startsWith("video") || component === "VideoPlayer") {
        const videoAudio = courseUnitAudio(courseId, unitId, "video");
        const key = pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "video", audioSrc: videoAudio, videoAutoplay: false });
        if (videoAudio) enqueue(key, videoAudio, () => { setMessages(prev => prev.map(m => m.key === key ? { ...m, videoAutoplay: true } : m)); });
        return;
      }

      if (renderKey.startsWith("submission") || component === "SubmissionCard") {
        const subAudio = courseUnitAudio(courseId, unitId, "submission");
        const key = pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "submission", audioSrc: subAudio });
        if (subAudio) enqueue(key, subAudio);
        return;
      }

      if (component === "QuizFeedback" || isWrongStep(sid)) {
        const qIdx = quizIndexFromStepId(sid);
        const questions = getUnitQuestions(unit);
        const q = qIdx !== null ? (questions[qIdx] ?? null) : null;
        const consolationAudio = qIdx !== null ? quizQuestionAudio(courseId, unitId, qIdx, "consolation") : "";
        const cheerUpAudio = (q as any)?.audio_location_cheer_up ?? "";
        const hintAudio = qIdx !== null ? quizQuestionAudio(courseId, unitId, qIdx, "hint") : "";
        const key = pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "quiz-wrong", quizQuestion: q ?? undefined, quizStepId: sid, audioSrc: consolationAudio || undefined, options: opts });
        if (consolationAudio) {
          enqueue(key, consolationAudio, () => {
            if (cheerUpAudio) enqueue(`${key}-cheerup`, cheerUpAudio, () => { if (hintAudio) enqueue(`${key}-hint`, hintAudio); });
            else if (hintAudio) enqueue(`${key}-hint`, hintAudio);
          });
        } else if (hintAudio) enqueue(key, hintAudio);
        return;
      }

      if (component === "QuizQuestion" || renderKey.startsWith("quiz")) {
        const qIdx = (step.question_number ?? (quizIndexFromStepId(sid) ?? 0) + 1) - 1;
        const questions = getUnitQuestions(unit);
        const q = questions[qIdx] ?? null;
        if (q) {
          const qAudio = quizQuestionAudio(courseId, unitId, qIdx);
          const key = pushMsg({ stepId: sid, from: "buddy", text: "", dynamicType: "quiz", quizQuestion: q, quizStepId: sid, audioSrc: qAudio, quizAudioSrc: qAudio });
          if (qAudio) enqueue(key, qAudio, () => { startTikTik(); });
          else startTikTik();
          return;
        }
      }

      if (renderKey === "champ-score" || component === "ScoreSummary") {
        const audio = dailyActivityAudio("DA-14");
        const key = pushMsg({ stepId: sid, from: "buddy", text: clean, dynamicType: "score", audioSrc: audio });
        enqueue(key, audio);
        const next = stepNext(step);
        if (next) setTimeout(() => advance(next), 1600);
        return;
      }

      if (renderKey === "next-unit" || component === "UnitPreviewCard") {
        const audio = dailyActivityAudio("DA-NEXT-UNIT");
        const key = pushMsg({ stepId: sid, from: "buddy", text: clean, dynamicType: "next-unit", audioSrc: audio });
        enqueue(key, audio);
        return;
      }
    }

    let audio = "";
    if (isWrongStep(sid)) {
      const qIdx = quizIndexFromStepId(sid);
      if (qIdx !== null) audio = quizQuestionAudio(courseId, unitId, qIdx, "consolation");
    } else {
      audio = dailyActivityAudio(sid);
    }

    if (mode === "buttons_only" || mode === "radio") {
      const key = pushMsg({ stepId: sid, from: "buddy", text: clean, audioSrc: audio || undefined, options: opts });
      if (audio) enqueue(key, audio);
      return;
    }

    if (mode === "static") {
      const next = stepNext(step);
      const hasAudio = !!audio;
      const key = pushMsg({ stepId: sid, from: "buddy", text: clean, audioSrc: audio || undefined, ptsAwarded: ptsVal, audioGate: hasAudio && !!next });
      if (ptsVal > 0) {
        award(ptsVal);
        if (sid === "DA-05" || hints.some(h => h.includes("10"))) videoPts.current += ptsVal;
        else if (sid === "DA-09" || hints.some(h => h.includes("20"))) submissionPts.current += ptsVal;
      }
      pendingAdvance.current = next;
      if (hasAudio) {
        enqueue(key, audio, () => {
          if (pendingAdvance.current) {
            const n = pendingAdvance.current;
            pendingAdvance.current = null;
            setTimeout(() => advance(n), 350);
          }
        });
      } else {
        const delay = step.delayMs ?? step.delay_after_submit_ms ?? 700;
        if (next) setTimeout(() => advance(next), delay);
      }
    }
  }, [currentId, stepMap, flow, unit, course]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopQueueAndRun = useCallback(<T extends unknown[]>(fn: (...args: T) => void) => {
    return (...args: T) => { skip(); fn(...args); };
  }, [skip]);

  const handleOption = useCallback((msgKey: string, stepSid: string, opt: StepOption) => {
    setMessages(prev => prev.map(m => (m.key === msgKey ? { ...m, answered: true } : m)));
    pushMsg({ stepId: "user", from: "user", text: opt.label });
    const next = opt.next_step ?? opt.next;
    if (opt.value === "later" || opt.id === "later") { router.push("/home"); return; }
    if (next) setTimeout(() => advance(next), 350);
    if (opt.value === "continue" || opt.id === "next-unit") updateStudent({ currentUnitIndex: (student.currentUnitIndex ?? 0) + 1 });
    if (opt.route) router.push(opt.route);
  }, [pushMsg, advance, router, updateStudent, student.currentUnitIndex]);

  const handleVideoComplete = useCallback((msgKey: string, stepSid: string) => {
    setMessages(prev => prev.map(m => (m.key === msgKey ? { ...m, answered: true } : m)));
    const step = stepMap[stepSid];
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), 350);
  }, [stepMap, advance]);

  const handleSubmit = useCallback((msgKey: string, stepSid: string) => {
    setMessages(prev => prev.map(m => (m.key === msgKey ? { ...m, answered: true } : m)));
    const step = stepMap[stepSid];
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), 700);
  }, [stepMap, advance]);

  const handleQuizAnswer = useCallback((msgKey: string, stepSid: string, correct: boolean) => {
    stopTikTik();
    setMessages(prev => prev.map(m => (m.key === msgKey ? { ...m, answered: true } : m)));
    if (correct) { playOneShot("/data/audio/correct.mp3"); } else { playOneShot("/data/audio/wrong.mp3"); }
    const step = stepMap[stepSid];
    if (correct) {
      const pts = step.on_correct ? 15 : (step.onCorrect?.pts ?? 15);
      award(pts);
      quizPts.current += pts;
      const next = step.on_correct?.next_step ?? step.onCorrect?.next;
      if (next) setTimeout(() => advance(next), 900);
    } else {
      const next = step.on_wrong?.next_step ?? step.onWrong?.next;
      if (next) setTimeout(() => advance(next), 900);
    }
  }, [stepMap, advance, award, stopTikTik]);

  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault();
    skip();
    const text = freeInput.trim();
    if (!text) return;
    setFreeInput("");
    pushMsg({ stepId: "user-free", from: "user", text });
    setFreeLoading(true);
    const reply = await askGroq(text, student.name);
    setFreeLoading(false);
    pushMsg({ stepId: "buddy-free", from: "buddy", text: reply });
  };

  const goBack = useCallback(() => {
    skip();
    stopTikTik();
    if (history.length === 0) { router.push("/home"); return; }
    const entry = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setMessages(prev => prev.slice(0, entry.snapshotLen));
    pendingAdvance.current = null;
    setShowFreeInput(false);
    visitCounters.current[entry.stepId] = (visitCounters.current[entry.stepId] ?? 0) + 1;
    setCurrentId(entry.stepId);
  }, [history, router, skip, stopTikTik]);

  const optionSelect = stopQueueAndRun(handleOption);
  const videoComplete = stopQueueAndRun(handleVideoComplete);
  const submit = stopQueueAndRun(handleSubmit);
  const quizAnswer = useCallback((msgKey: string, stepSid: string, correct: boolean) => {
    skip();
    handleQuizAnswer(msgKey, stepSid, correct);
  }, [skip, handleQuizAnswer]);

  const nextUnit = course ? (course.units[(student.currentUnitIndex ?? 0) + 1] ?? null) : null;
  const isEnd = currentId === "DA-END" || showFreeInput;
  const isActivityComplete = showFreeInput || currentId === "DA-END";

  const HEADER_H = 60;
  const LEFT_W = 220;
  const RIGHT_W = 200;
  const NAV_OFFSET = 220;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <AppHeader
        title="TAP Buddy"
        subtitle={`${getPartOfDay()} · ${unit ? getUnitName(unit) : ""}`}
        onBack={goBack}
        points={student.points}
        buddyContext={{
          screen: "chat",
          currentUnit: unit ? getUnitName(unit) : undefined,
          currentCourse: (student.courseId ?? student.selected_course) as string | undefined,
          currentStep: currentId,
          lastBotText: messages.filter(m => m.from === "buddy" && m.text).slice(-1)[0]?.text,
        }}
        onBuddyOpen={() => { pause(); stopTikTik(); }}
        onBuddyClose={() => { resume(); }}
      />

      <div
        className="hidden lg:flex flex-col gap-3 p-4"
        style={{
          position: "fixed",
          top: HEADER_H,
          left: NAV_OFFSET,
          width: LEFT_W,
          bottom: 0,
          borderRight: "1px solid var(--border-soft)",
          background: "var(--bg)",
          overflowY: "auto",
          zIndex: 10,
        }}
      >
        {unit && (
          <div className="card-float p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
                <BookOpen size={13} strokeWidth={2.3} />
              </div>
              <p className="font-display font-bold text-xs" style={{ color: "var(--text-main)" }}>Current Unit</p>
            </div>
            <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-main)" }}>{getUnitName(unit)}</p>
            {course && (
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                Unit {(student.currentUnitIndex ?? 0) + 1} of {course.units.length}
              </p>
            )}
          </div>
        )}

        {course && (
          <div className="card-float p-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layers size={12} strokeWidth={2.3} style={{ color: "var(--text-muted)" }} />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>All units</p>
            </div>
            {course.units.map((u, i) => {
              const isDone = i < (student.currentUnitIndex ?? 0);
              const isCurrent = i === (student.currentUnitIndex ?? 0);
              return (
                <div
                  key={u.unit_id ?? i}
                  className="flex items-center gap-2 py-1 px-1.5 rounded-lg"
                  style={{ background: isCurrent ? "var(--lavender)" : "transparent" }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
                    style={{
                      background: isDone ? "#EDFAF0" : isCurrent ? "var(--lavender-strong)" : "var(--bg-soft)",
                      color: isDone ? "#27AE60" : isCurrent ? "white" : "var(--text-muted)",
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <p className="text-[10px] font-semibold truncate leading-snug" style={{ color: isCurrent ? "var(--lavender-strong)" : "var(--text-muted)" }}>
                    {getUnitName(u)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="card-float p-3">
          <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>Session points</p>
          <p className="font-display font-extrabold text-xl" style={{ color: "var(--lavender-strong)" }}>+{sessionPts}</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>earned today</p>
        </div>
      </div>

      <div
        className="hidden lg:flex flex-col"
        style={{
          position: "fixed",
          top: HEADER_H,
          right: 0,
          width: RIGHT_W,
          bottom: 0,
          borderLeft: "1px solid var(--border-soft)",
          background: "var(--bg)",
          zIndex: 10,
        }}
      >
        <div className="p-4 flex flex-col gap-2 h-full">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Activity reveal
          </p>
          <div className="relative rounded-2xl overflow-hidden flex-1">
            <img
              src="/assets/reveal.png"
              alt="Reveal"
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {!isActivityComplete && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                style={{
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  background: "rgba(238, 240, 255, 0.55)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--white)", color: "var(--lavender-strong)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold text-center leading-tight px-3" style={{ color: "var(--lavender-strong)" }}>
                  Complete the activity to reveal
                </p>
              </div>
            )}
          </div>
          {isActivityComplete && (
            <p className="text-[10px] font-semibold text-center" style={{ color: "#27AE60" }}>🎉 Revealed!</p>
          )}
        </div>
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: 0,
          paddingLeft: 0,
        }}
      >
        <div
          className="flex-1 flex flex-col"
          style={{
            marginLeft: 0,
          }}
        >
          <div
            className="overflow-y-auto px-3 py-3 flex flex-col gap-2 pb-44 lg:pb-24"
            style={{
              marginTop: HEADER_H,
              marginLeft: 0,
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <div
              className="w-full mx-auto flex flex-col gap-3"
              style={{
                maxWidth: "600px",
                paddingLeft: 0,
              }}
            >
              <div
                className="hidden lg:block"
                style={{ height: "1px", marginLeft: `${LEFT_W}px` }}
              />

              <div style={{ marginLeft: 0 }}>
                {messages.map(msg => (
                  <div key={msg.key} className="animate-pop mb-3">
                    {msg.from === "user" ? (
                      <MessageBubble variant="user" text={msg.text} />
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {msg.text && (
                          <MessageBubble
                            variant="bot"
                            text={msg.text}
                            hasAudio={!!msg.audioSrc}
                            isActive={activeKey === msg.key}
                            onReplay={() => msg.audioSrc && replay(msg.audioSrc, msg.key)}
                          />
                        )}

                        {(msg.ptsAwarded ?? 0) > 0 && (
                          <PtsBadge pts={msg.ptsAwarded!} />
                        )}

                        {msg.dynamicType === "video" && unit && (
                          <VideoRender
                            content={unit.video}
                            answered={msg.answered}
                            autoplay={msg.videoAutoplay ?? false}
                            onComplete={() => videoComplete(msg.key, msg.stepId)}
                          />
                        )}

                        {msg.dynamicType === "submission" && unit && (
                          <SubmissionRender
                            content={unit.submission}
                            courseId={(student.courseId ?? student.selected_course) as string}
                            submitted={msg.answered}
                            onSubmit={() => submit(msg.key, msg.stepId)}
                          />
                        )}

                        {msg.dynamicType === "quiz" && msg.quizQuestion && (
                          <QuizRender
                            question={msg.quizQuestion}
                            answered={msg.answered}
                            onAnswer={correct => quizAnswer(msg.key, msg.stepId, correct)}
                            enqueueAudio={enqueue}
                            replayAudio={replay}
                            activeAudioKey={activeKey}
                            stopAudioQueue={skip}
                          />
                        )}

                        {msg.dynamicType === "quiz-wrong" && msg.quizQuestion && (
                          <div className="flex flex-col gap-1.5">
                            {(msg.quizQuestion as any).consolation && (
                              <MessageBubble
                                variant="bot-alt"
                                text={(msg.quizQuestion as any).consolation_voice_text ?? (msg.quizQuestion as any).consolation}
                                hasAudio={!!msg.audioSrc}
                                isActive={activeKey === msg.key}
                                onReplay={() => msg.audioSrc && replay(msg.audioSrc, msg.key)}
                              />
                            )}
                            {(msg.quizQuestion as any).hint && (
                              <MessageBubble variant="bot-alt" text={`💡 ${(msg.quizQuestion as any).hint}`} />
                            )}
                            {!msg.answered && msg.options && (
                              <OptionButtons options={msg.options} onSelect={opt => optionSelect(msg.key, msg.stepId, opt)} />
                            )}
                          </div>
                        )}

                        {msg.dynamicType === "score" && (
                          <ScoreCard videoPts={videoPts.current} submissionPts={submissionPts.current} quizPts={quizPts.current} total={sessionPts} />
                        )}

                        {msg.dynamicType === "next-unit" && (
                          <NextUnitCard
                            unit={nextUnit}
                            course={course}
                            onGo={() => {
                              skip();
                              updateStudent({ currentUnitIndex: (student.currentUnitIndex ?? 0) + 1 });
                              router.push("/home");
                            }}
                          />
                        )}

                        {!msg.answered && msg.options && !msg.dynamicType && (
                          <OptionButtons options={msg.options} onSelect={opt => optionSelect(msg.key, msg.stepId, opt)} />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {freeLoading && (
                  <div className="flex items-end gap-2 animate-pop mb-3">
                    <img
                      src="/assets/profilepic.png"
                      alt="TAP Buddy"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      style={{ border: "2px solid var(--lavender)" }}
                    />
                    <div className="bubble bubble-bot flex gap-1 items-center">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>

          {isEnd && (
            <div
              className="shrink-0 px-3 py-3"
              style={{
                position: "fixed",
                bottom: 0,
                left: `${NAV_OFFSET + LEFT_W}px`,
                right: `${RIGHT_W}px`,
                borderTop: "1px solid var(--border-soft)",
                background: "var(--bg)",
                zIndex: 10,
              }}
            >
              <form onSubmit={handleFreeInput} className="flex gap-2 max-w-xl mx-auto">
                <input
                  value={freeInput}
                  onChange={e => setFreeInput(e.target.value)}
                  placeholder="Ask TAP Buddy anything…"
                  className="pill-input flex-1 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary w-11 h-11 flex items-center justify-center shrink-0"
                  disabled={!freeInput.trim()}
                  aria-label="Send"
                >
                  <Send size={17} strokeWidth={2.4} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
} 
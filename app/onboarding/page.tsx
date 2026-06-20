"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import {
  buildStepMap, interpolate, stripRenderHints, resolvePts,
  stepNext, stepText, stepInputMode, stepOptions, makeVisitKey,
  FlowStep, FlowData, StepOption,
} from "@/lib/flow-engine";
import { onboardingAudio } from "@/lib/audio-paths";
import { useAudioQueue } from "@/lib/use-audio-queue";
import { AppHeader } from "../../components/shared/Appheader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OptionButtons } from "@/components/chat/OptionButtons";
import { ProfileCardRender } from "@/components/renders/ProfileCardRender";
import { PtsBadge } from "@/components/renders/PtsBadge";
import { ConfettiRender } from "@/components/renders/ConfettiRender";
import { Send } from "lucide-react";

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
  audioGate?: boolean;
}

interface HistoryEntry {
  stepId: string;
  snapshotLen: number;
  visitIndex: number;
}

export default function OnboardingPage() {
  const { student, updateStudent, addPoints } = useStudent();
  const router = useRouter();
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [stepMap, setStepMap] = useState<Record<string, FlowStep>>({});
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentId, setCurrentId] = useState("OB-01");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [freeInputStep, setFreeInputStep] = useState<{ stepId: string; next: string | null } | null>(null);
  const [freeText, setFreeText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { enqueue, replay, skip, pause, resume, activeKey } = useAudioQueue();

  const visitCounters = useRef<Record<string, number>>({});
  const lastProcessedVisitKey = useRef<string | null>(null);
  const currentVisitIndex = useRef<number>(0);
  const pendingAdvance = useRef<string | null>(null);

  useEffect(() => {
    fetch("/data/onboarding.json").then(r => r.json()).then((d: FlowData) => {
      setFlow(d);
      setStepMap(buildStepMap(d.steps));
    });
  }, []);

  const markAnswered = useCallback((key: string) => {
    setMessages(prev => prev.map(m => (m.key === key ? { ...m, answered: true } : m)));
  }, []);

  const advance = useCallback((nextId: string | null) => {
    if (!nextId) return;
    setHistory(h => [...h, { stepId: currentId, snapshotLen: messages.length, visitIndex: currentVisitIndex.current }]);
    visitCounters.current[nextId] = (visitCounters.current[nextId] ?? 0) + 1;
    setCurrentId(nextId);
  }, [currentId, messages.length]);

  const pushMsg = useCallback((msg: Omit<Msg, "key">) => {
    const key = `${msg.stepId}-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { ...msg, key }]);
    return key;
  }, []);

  useEffect(() => {
    if (!flow || !stepMap[currentId]) return;
    const sid = currentId;

    if (visitCounters.current[sid] === undefined) visitCounters.current[sid] = 1;
    const visitIndex = visitCounters.current[sid];
    const visitKey = makeVisitKey(sid, visitIndex);
    currentVisitIndex.current = visitIndex;

    if (lastProcessedVisitKey.current === visitKey) return;
    lastProcessedVisitKey.current = visitKey;

    const step = stepMap[sid];
    const mode = stepInputMode(step);
    const rawText = stepText(step);
    const { clean, hints } = stripRenderHints(interpolate(rawText, student));
    const ptsHint = hints.find(h => resolvePts(h) !== null);
    const ptsVal = ptsHint ? resolvePts(ptsHint)! : (step.points_awarded ?? 0);

    let displayText = clean;
    const courseKey = student.selected_course ?? student.courseId ?? "";
    const audioSrc = onboardingAudio(sid, courseKey);

    if (step.variants) {
      const v = step.variants[courseKey];
      if (v) {
        const { clean: vc } = stripRenderHints(interpolate(v.display_text, student));
        displayText = vc;
      }
    }

    if (mode === "free_text") {
      const key = pushMsg({ stepId: sid, from: "buddy", text: displayText, audioSrc });
      enqueue(key, audioSrc);
      setFreeInputStep({ stepId: sid, next: stepNext(step) });
      return;
    }

    const opts = stepOptions(step);
    const key = pushMsg({
      stepId: sid, from: "buddy", text: displayText, audioSrc, renderHints: hints, ptsAwarded: ptsVal,
      fields: step.form_fields ?? step.fields, subFields: step.sub_display,
      options: mode === "buttons_only" || mode === "radio" ? opts : undefined,
      style: mode === "radio" ? "radio" : undefined,
      audioGate: mode === "static" && !!stepNext(step),
    });

    if (ptsVal > 0) addPoints(ptsVal);

    if (mode === "static") {
      const next = stepNext(step);
      pendingAdvance.current = next;
      if (audioSrc) {
        enqueue(key, audioSrc, () => {
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
    } else if (audioSrc) {
      enqueue(key, audioSrc);
    }
  }, [currentId, stepMap, flow]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopQueueAndRun = useCallback(<T extends unknown[]>(fn: (...args: T) => void) => {
    return (...args: T) => { skip(); fn(...args); };
  }, [skip]);

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
    if (opt.value === "start_learning" || opt.id === "start") {
      updateStudent({ onboardingDone: true });
      router.push("/home");
      return;
    }
    if (nextFromOpt) setTimeout(() => advance(nextFromOpt), 350);
  }, [stepMap, markAnswered, pushMsg, updateStudent, advance, router]);

  const handleFormSave = useCallback((msgKey: string, stepSid: string) => {
    markAnswered(msgKey);
    const patch: Record<string, string> = {};
    const step = stepMap[stepSid];
    const fields = step.form_fields ?? step.fields ?? [];
    fields.forEach(f => { if (editing[f.key] !== undefined) patch[f.key] = editing[f.key]; });
    if (Object.keys(patch).length > 0) updateStudent(patch as never);
    setEditing({});
    const next = stepNext(step);
    if (next) setTimeout(() => advance(next), 350);
  }, [stepMap, editing, markAnswered, updateStudent, advance]);

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
    if (next) setTimeout(() => advance(next), 350);
  }, [freeInputStep, freeText, stepMap, updateStudent, pushMsg, advance]);

  const goBack = useCallback(() => {
    skip();
    if (history.length === 0) { router.push("/demo"); return; }
    const entry = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setMessages(prev => prev.slice(0, entry.snapshotLen));
    pendingAdvance.current = null;
    setFreeInputStep(null);
    visitCounters.current[entry.stepId] = (visitCounters.current[entry.stepId] ?? 0) + 1;
    setCurrentId(entry.stepId);
  }, [history, router, skip]);

  const optionSelect = stopQueueAndRun(handleOption);
  const formSave = stopQueueAndRun(handleFormSave);
  const freeTextSend = stopQueueAndRun(handleFreeTextSend);

  const lastBotText = messages.filter(m => m.from === "buddy" && m.text).slice(-1)[0]?.text;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <AppHeader
        title="Getting to know you"
        subtitle="Onboarding"
        onBack={goBack}
        buddyContext={{ screen: "onboarding", lastBotText }}
        onBuddyOpen={() => { pause(); }}
        onBuddyClose={() => { resume(); }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className="hidden lg:flex flex-col gap-6 p-8 shrink-0 justify-center"
          style={{ width: "340px", borderRight: "1px solid var(--border-soft)" }}
        >
          <div className="flex flex-col items-start gap-4">
            <img
              src="/assets/profilepic.png"
              alt="TAP Buddy"
              className="w-16 h-16 rounded-2xl object-cover"
              style={{ border: "3px solid var(--lavender)" }}
            />
            <div>
              <h2 className="font-display font-extrabold text-2xl leading-tight" style={{ color: "var(--text-main)" }}>
                Welcome to<br />The Apprentice Project
              </h2>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Let's get you set up with a personalised learning experience. Answer a few quick questions to get started.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {["Pick your course", "Tell us about yourself", "Start learning"].map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-display"
                  style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}
                >
                  {i + 1}
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-3 lg:px-6 py-4 lg:py-6 flex flex-col gap-3 pb-32 lg:pb-24">
            <div className="max-w-xl lg:max-w-2xl w-full mx-auto flex flex-col gap-4">
              {messages.map(msg => (
                <div key={msg.key} className="animate-pop">
                  {msg.from === "user" ? (
                    <MessageBubble variant="user" text={msg.text} />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {msg.text && (
                          <MessageBubble
                            variant="bot"
                            text={msg.text}
                            hasAudio={!!msg.audioSrc}
                            isActive={activeKey === msg.key}
                            onReplay={() => msg.audioSrc && replay(msg.audioSrc, msg.key)}
                          />
                        )}

                        {msg.renderHints?.includes("confetti") && <ConfettiRender />}

                        {msg.ptsAwarded && msg.ptsAwarded > 0 && msg.renderHints?.some(h => resolvePts(h) !== null) && (
                          <div style={{ paddingBottom: "12px" }}>
                            <PtsBadge pts={msg.ptsAwarded} />
                          </div>
                        )}

                        {msg.subFields && (
                          <div className="card-float p-4 flex flex-col gap-2">
                            {msg.subFields.fields.map(f => (
                              <div key={f.key} className="flex justify-between text-sm">
                                <span style={{ color: "var(--text-muted)" }}>{f.label}</span>
                                <span className="font-semibold" style={{ color: "var(--text-main)" }}>
                                  {String((student as unknown as Record<string, unknown>)[f.key] ?? "—")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {!msg.answered && msg.fields && (stepMap[msg.stepId]?.input_mode === "form" || stepMap[msg.stepId]?.type === "profile-card") && (
                          <ProfileCardRender
                            fields={msg.fields}
                            student={student}
                            editing={editing}
                            answered={msg.answered}
                            onChange={(k, v) => setEditing(e => ({ ...e, [k]: v }))}
                            onSave={() => formSave(msg.key, msg.stepId)}
                          />
                        )}

                        {!msg.answered && msg.options && (
                          <OptionButtons options={msg.options} style={msg.style} onSelect={opt => optionSelect(msg.key, msg.stepId, opt)} />
                        )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {freeInputStep && (
            <div className="shrink-0 px-3 lg:px-6 py-3" style={{ borderTop: "1px solid var(--border-soft)", background: "var(--bg)" }}>
              <div className="flex gap-2 max-w-xl lg:max-w-2xl mx-auto">
                <input
                  className="pill-input flex-1 text-sm"
                  placeholder="Type here…"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && freeTextSend()}
                  autoFocus
                />
                <button
                  className="btn-primary w-11 h-11 flex items-center justify-center shrink-0"
                  disabled={!freeText.trim()}
                  onClick={() => freeTextSend()}
                  aria-label="Send"
                >
                  <Send size={17} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
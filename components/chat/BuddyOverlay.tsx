"use client";
import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { askGroqWithHistory, GroqMessage, BuddyContext } from "@/lib/groq";

interface OverlayMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

interface Props {
  context: BuddyContext;
  onClose: () => void;
}

export function BuddyOverlay({ context, onClose }: Props) {
  const [messages, setMessages] = useState<OverlayMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const greeting = context.currentUnit
      ? `Hey ${context.studentName || "champ"} 👋 I'm TAP Buddy. You're on "${context.currentUnit}" — what's on your mind?`
      : `Hey ${context.studentName || "champ"} 👋 I'm TAP Buddy. Ask me anything!`;
    setMessages([{ id: "greeting", role: "assistant", text: greeting }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: OverlayMsg = { id: `u-${Date.now()}`, role: "user", text };
    const loadingId = `a-${Date.now()}`;
    const loadingMsg: OverlayMsg = { id: loadingId, role: "assistant", text: "", loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    setMessages(prev => {
      const historyMsgs = prev.filter(m => !m.loading && m.text.trim().length > 0);
      const history: GroqMessage[] = historyMsgs.map(m => ({ role: m.role as "user" | "assistant", content: m.text }));
      history.push({ role: "user", content: text });
      askGroqWithHistory(history, context).then(reply => {
        setMessages(curr => curr.map(m => m.id === loadingId ? { ...m, loading: false, text: reply } : m));
        setLoading(false);
      });
      return prev;
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col w-full lg:w-[560px] rounded-t-3xl lg:rounded-3xl overflow-hidden"
        style={{
          background: "var(--white)",
          height: "min(580px, 92dvh)",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.18)",
        }}
      >
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-soft)" }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
            <Sparkles size={16} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-display font-bold text-sm" style={{ color: "var(--text-main)" }}>TAP Buddy</span>
            {context.currentUnit && (
              <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{context.currentUnit}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "var(--border-soft)", color: "var(--text-muted)" }}
            aria-label="Close TAP Buddy"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.loading ? (
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center" style={{ background: "var(--lavender)" }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              ) : (
                <div
                  className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                  style={
                    msg.role === "user"
                      ? { background: "var(--lavender-strong)", color: "var(--white)", borderBottomRightRadius: 4 }
                      : { background: "var(--lavender)", color: "var(--text-main)", borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 px-5 pb-5 pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask TAP Buddy…"
              className="pill-input flex-1 text-sm"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn-primary w-10 h-10 flex items-center justify-center shrink-0"
              aria-label="Send"
            >
              <Send size={15} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
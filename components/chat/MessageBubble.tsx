"use client";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  text: string;
  variant: "bot" | "bot-alt" | "user";
  hasAudio?: boolean;
  isActive?: boolean;
  onReplay?: () => void;
};

export function MessageBubble({ text, variant, hasAudio, isActive, onReplay }: Props) {
  const isUser = variant === "user";
  const cls = variant === "bot-alt" ? "bubble bubble-bot-alt" : isUser ? "bubble bubble-user" : "bubble bubble-bot";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img
          src="/assets/profilepic.png"
          alt="TAP Buddy"
          className="w-8 h-8 rounded-full object-cover shrink-0"
          style={{ border: "2px solid var(--lavender)" }}
        />
      )}
      <div className={cls} style={{ position: "relative", maxWidth: "min(75%, 520px)" }}>
        <p className="whitespace-pre-line" style={{ color: isUser ? "var(--white)" : "var(--text-main)" }}>
          {text}
        </p>
        {!isUser && hasAudio && (
          <button
            className="vol-icon-btn"
            onClick={onReplay}
            aria-label={isActive ? "Playing audio" : "Play audio again"}
            title={isActive ? "Playing…" : "Play again"}
          >
            {isActive
              ? <Volume2 size={13} strokeWidth={2.4} />
              : <VolumeX size={13} strokeWidth={2.4} style={{ opacity: 0.55 }} />
            }
          </button>
        )}
      </div>
      <style jsx>{`
        .vol-icon-btn {
          position: absolute;
          bottom: -10px;
          right: -8px;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: white;
          border: 1px solid var(--border-soft, #e5e5ea);
          color: #5b5bef;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          cursor: pointer;
        }
        .vol-icon-btn:hover {
          background: var(--lavender, #e9e7ff);
        }
      `}</style>
    </div>
  );
} 
"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface VideoContent {
  title: string;
  youtube_url?: string;
  url?: string;
  description?: string;
  voice_text?: string;
  points?: number;
}

interface Props {
  content: VideoContent;
  answered?: boolean;
  autoplay?: boolean;
  onComplete: () => void;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function VideoRender({ content, answered, autoplay, onComplete }: Props) {
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = getYouTubeId(content.youtube_url ?? content.url);

  const autoplayParam = autoplay ? 1 : 0;
  const src = ytId
    ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=${autoplayParam}&enablejsapi=1`
    : null;

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    if (iframeRef.current && src) {
      iframeRef.current.src = src.replace("autoplay=1", "autoplay=0").replace("autoplay=0", "autoplay=0");
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      } catch {}
    }
    onComplete();
  };

  return (
    <div className="pl-10">
      <div className="card-float overflow-hidden">
        {src && (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              ref={iframeRef}
              src={src}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        )}

        <div className="p-4 flex flex-col gap-3">
          <div>
            <p className="font-display font-bold text-sm" style={{ color: "var(--text-main)" }}>{content.title}</p>
            {content.description && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{content.description}</p>
            )}
          </div>

          {!completed ? (
            <button
              className="btn-primary py-2.5 text-sm w-full flex items-center justify-center gap-2"
              onClick={handleComplete}
            >
              <CheckCircle2 size={16} strokeWidth={2.4} />
              Mark as complete
            </button>
          ) : (
            <div
              className="py-2.5 text-sm w-full flex items-center justify-center gap-2 rounded-xl font-semibold"
              style={{ background: "#EDFAF0", color: "#27AE60" }}
            >
              <CheckCircle2 size={16} strokeWidth={2.4} />
              Video complete! +{content.points ?? 10} pts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { BuddyOverlay } from "@/components/chat/BuddyOverlay";
import { BuddyContext } from "@/lib/groq";

interface Props {
  context?: Partial<BuddyContext>;
  onOpen?: () => void;
  onClose?: () => void;
}

export function BuddyChip({ context, onOpen, onClose }: Props) {
  const [open, setOpen] = useState(false);

  const resolvedContext: BuddyContext = {
    studentName: context?.studentName,
    currentUnit: context?.currentUnit,
    currentCourse: context?.currentCourse,
    lastBotText: context?.lastBotText,
    screen: context?.screen,
    currentStep: context?.currentStep,
  };

  const handleOpen = () => {
    setOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="chip"
        style={{ background: "var(--lavender)", color: "var(--lavender-strong)", cursor: "pointer" }}
        aria-label="Open TAP Buddy"
      >
        <Sparkles size={13} strokeWidth={2.5} />
        <span>TAP Buddy</span>
      </button>

      {open &&
        createPortal(
          <BuddyOverlay context={resolvedContext} onClose={handleClose} />,
          document.body
        )}
    </>
  );
}
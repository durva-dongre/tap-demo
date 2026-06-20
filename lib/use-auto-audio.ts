"use client";
import { useEffect, useRef, useState } from "react";

export function useAutoAudio(src?: string | null, onEnded?: () => void) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const hasAudio = !!src;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!src) {
      onEndedRef.current?.();
      return;
    }
    const a = new Audio(src);
    ref.current = a;
    const finish = () => {
      setPlaying(false);
      onEndedRef.current?.();
    };
    a.onended = finish;
    a.onerror = finish;
    a.play().then(() => setPlaying(true)).catch(finish);
    return () => {
      a.pause();
      a.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const replay = () => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => {});
  };

  const stop = () => {
    const a = ref.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
  };

  return { hasAudio, playing, replay, stop };
}

export function playOneShot(src: string, volume: number = 1) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
    return a;
  } catch {
    return null;
  }
}
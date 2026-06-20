"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface QueueItem {
  key: string;
  src: string;
  onDone?: () => void;
}

export function useAudioQueue() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    audioRef.current = a;
    const unlock = () => {
      setUnlocked(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      a.pause();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const playNext = useCallback(() => {
    const a = audioRef.current;
    if (!a || pausedRef.current) return;
    const item = queueRef.current[0];
    if (!item) {
      playingRef.current = false;
      setActiveKey(null);
      return;
    }
    playingRef.current = true;
    setActiveKey(item.key);
    a.src = item.src;
    a.currentTime = 0;
    a.play().catch(() => {
      queueRef.current.shift();
      item.onDone?.();
      playNext();
    });
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handleEnd = () => {
      const item = queueRef.current.shift();
      item?.onDone?.();
      playNext();
    };
    const handleErr = () => {
      const item = queueRef.current.shift();
      item?.onDone?.();
      playNext();
    };
    a.addEventListener("ended", handleEnd);
    a.addEventListener("error", handleErr);
    return () => {
      a.removeEventListener("ended", handleEnd);
      a.removeEventListener("error", handleErr);
    };
  }, [playNext]);

  const enqueue = useCallback((key: string, src: string, onDone?: () => void) => {
    if (!src) {
      onDone?.();
      return;
    }
    queueRef.current.push({ key, src, onDone });
    if (!playingRef.current && !pausedRef.current) playNext();
  }, [playNext]);

  const replay = useCallback((src: string, key: string) => {
    const a = audioRef.current;
    if (!a || !src) return;
    queueRef.current = queueRef.current.filter(q => q.key !== key);
    pausedRef.current = false;
    a.pause();
    a.src = src;
    a.currentTime = 0;
    playingRef.current = true;
    setActiveKey(key);
    a.play().catch(() => {
      playingRef.current = false;
      setActiveKey(null);
    });
  }, []);

  const skip = useCallback(() => {
    queueRef.current = [];
    pausedRef.current = false;
    const a = audioRef.current;
    if (a) a.pause();
    playingRef.current = false;
    setActiveKey(null);
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    const a = audioRef.current;
    if (a && !a.paused) a.pause();
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    const a = audioRef.current;
    if (!a) return;
    if (activeKey && a.src) {
      a.play().then(() => {
        playingRef.current = true;
      }).catch(() => {
        playingRef.current = false;
        setActiveKey(null);
        playNext();
      });
    } else {
      playNext();
    }
  }, [activeKey, playNext]);

  return { enqueue, replay, skip, pause, resume, activeKey, unlocked };
}
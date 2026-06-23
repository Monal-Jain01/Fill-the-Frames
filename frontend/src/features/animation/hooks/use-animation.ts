import { useState, useEffect, useCallback, useRef } from "react";
import { AnimationFrame, AnimationSettings, PlaybackState } from "../types";
import { DEFAULT_ANIMATION_FPS, DEFAULT_PLAYBACK_SPEED } from "../constants";

export function useAnimation(initialFrames: AnimationFrame[] = []) {
  const [frames, setFrames] = useState<AnimationFrame[]>(initialFrames);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    initialFrames.length > 0 ? "idle" : "stopped"
  );
  
  const [settings, setSettings] = useState<AnimationSettings>({
    fps: DEFAULT_ANIMATION_FPS,
    loopMode: false,
    playbackSpeed: DEFAULT_PLAYBACK_SPEED,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = frames.length;
  const isPlaying = playbackState === "playing";

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (totalFrames === 0) return;
    
    // If we are at the end and starting to play, loop back to start if needed
    if (currentFrameIndex >= totalFrames - 1) {
      setCurrentFrameIndex(0);
    }
    
    setPlaybackState("playing");
  }, [totalFrames, currentFrameIndex]);

  const pause = useCallback(() => {
    if (playbackState === "playing") {
      setPlaybackState("paused");
      stopTimer();
    }
  }, [playbackState, stopTimer]);

  const stop = useCallback(() => {
    setPlaybackState("stopped");
    setCurrentFrameIndex(0);
    stopTimer();
  }, [stopTimer]);

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => {
      const next = prev + 1;
      if (next >= totalFrames) {
        if (settings.loopMode) {
          return 0;
        } else {
          setPlaybackState("stopped"); // Auto-stop at the end if not looping
          stopTimer();
          return prev;
        }
      }
      return next;
    });
  }, [totalFrames, settings.loopMode, stopTimer]);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const jumpToFrame = useCallback((index: number) => {
    if (index >= 0 && index < totalFrames) {
      setCurrentFrameIndex(index);
    }
  }, [totalFrames]);

  const updateSettings = useCallback((newSettings: Partial<AnimationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Handle animation loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 1000 / (settings.fps * settings.playbackSpeed);
      timerRef.current = setInterval(() => {
        nextFrame();
      }, intervalMs);
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [isPlaying, settings.fps, settings.playbackSpeed, nextFrame, stopTimer]);

  const exportFramesReady = totalFrames > 0 && frames.every(f => f.imageData);

  return {
    frames,
    currentFrameIndex,
    currentFrame: frames[currentFrameIndex] || null,
    playbackState,
    settings,
    totalFrames,
    exportFramesReady,
    
    play,
    pause,
    stop,
    nextFrame,
    prevFrame,
    jumpToFrame,
    updateSettings,
    setFrames,
  };
}

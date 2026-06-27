import { useEffect, useRef } from "react";
import { useAnimationStore } from "@/store/animation-store";

export function useAnimation() {
  const { 
    frames, 
    selectedVariable,
    playing, 
    playbackSpeed, 
    nextFrame 
  } = useAnimationStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const filteredFrames = selectedVariable 
    ? frames.filter(f => f.variable === selectedVariable)
    : frames;

  // Timer orchestration
  useEffect(() => {
    if (playing && filteredFrames.length > 0) {
      // Base FPS for 1x speed. E.g., 2 frames per second base.
      const intervalMs = 1000 / (2 * playbackSpeed);
      
      timerRef.current = setInterval(() => {
        nextFrame();
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, playbackSpeed, filteredFrames.length, nextFrame]);

  // Preload all frames for the selected sequence
  useEffect(() => {
    if (filteredFrames.length === 0) return;

    filteredFrames.forEach(frame => {
      if (frame && frame.imageUrl) {
        const img = new Image();
        img.src = frame.imageUrl;
      }
    });
  }, [filteredFrames]);

  return null;
}


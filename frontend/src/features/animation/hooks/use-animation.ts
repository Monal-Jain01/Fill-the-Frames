import { useEffect, useRef } from "react";
import { useAnimationStore } from "@/store/animation-store";

export function useAnimation() {
  const { 
    frames, 
    selectedVariable,
    currentFrameIndex, 
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

  // Preloading N+1 and N+2
  useEffect(() => {
    if (filteredFrames.length === 0) return;

    const preloadImage = (index: number) => {
      const frame = filteredFrames[index % filteredFrames.length];
      if (frame && frame.imageUrl) {
        const img = new Image();
        img.src = frame.imageUrl;
      }
    };

    // Preload next 2 frames to avoid stutter
    preloadImage(currentFrameIndex + 1);
    preloadImage(currentFrameIndex + 2);
  }, [currentFrameIndex, filteredFrames]);

  return null;
}


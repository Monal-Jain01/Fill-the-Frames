import { useEffect, useRef } from "react";
import { useAnimationStore } from "@/store/animation-store";
import { animationClient } from "@/lib/api/animation-client";
import { visualizationClient } from "@/lib/api/visualization-client";

export function useAnimation() {
  const { 
    frames, 
    selectedVariable,
    currentFrameIndex, 
    playing, 
    playbackSpeed, 
    nextFrame,
    setFrames,
    setLoading,
    setError
  } = useAnimationStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
  // Default bounds for India (used while fetching real bounds)
  const fallbackBounds: [[number, number], [number, number]] = [[8.0, 68.0], [37.0, 97.0]];

  const filteredFrames = selectedVariable 
    ? frames.filter(f => f.variable === selectedVariable)
    : frames;

  // Poll for latest frames every 15 minutes
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        setLoading(true);
        const data = await animationClient.getLatestFrames(selectedVariable || "TIR1");
        
        // Background: Fetch bounds for the first frame if needed
        if (data.length > 0 && !data[0].bounds) {
          try {
            const boundsRes = await visualizationClient.getBounds(data[0].frameId, selectedVariable || "TIR1");
            const boundsArray = (boundsRes as any).bounds || (boundsRes as any).data?.bounds;
            // Apply to all frames (assuming they share the same geographic area)
            data.forEach(f => f.bounds = boundsArray);
          } catch (e) {
            console.error("Failed to fetch bounds", e);
            data.forEach(f => f.bounds = fallbackBounds);
          }
        }
        
        setFrames(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch animation frames", err);
        setError("Could not load latest animation frames.");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchFrames();

    // Poll every 15 minutes (900000 ms)
    pollingRef.current = setInterval(fetchFrames, 900000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedVariable, setFrames, setLoading, setError]);

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


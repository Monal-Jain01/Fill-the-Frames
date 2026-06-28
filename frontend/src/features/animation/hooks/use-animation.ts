import { useEffect, useRef } from "react";
import { useAnimationStore } from "@/store/animation-store";
import { visualizationClient } from "@/lib/api/visualization-client";
import { animationClient } from "@/lib/api/animation-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sid385-fill-the-frames.hf.space/api/v1";
const SERVER_ORIGIN = BASE_URL.replace("/api/v1", "");

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
  
  // Default bounds for India
  const fallbackBounds: [[number, number], [number, number]] = [[8.0, 68.0], [37.0, 97.0]];

  const filteredFrames = selectedVariable 
    ? frames.filter(f => f.variable === selectedVariable)
    : frames;

  // Function to process backend frames
  const processFrames = async (data: any[], targetVariable: string) => {
    if (!data || data.length === 0) return;
    
    // Ensure URLs are absolute and bounds are properly formatted arrays
    const absoluteData = data.map((frame: any) => ({
      ...frame,
      imageUrl: frame.imageUrl.startsWith("http") ? frame.imageUrl : `${SERVER_ORIGIN}${frame.imageUrl}`,
      bounds: Array.isArray(frame.bounds) ? frame.bounds : (frame.bounds?.bounds || null)
    }));

    // Background: Fetch bounds for the first frame if needed
    if (!absoluteData[0].bounds) {
      try {
        const boundsRes = await visualizationClient.getBounds(absoluteData[0].frameId, targetVariable);
        const boundsArray = (boundsRes as any).bounds || (boundsRes as any).data?.bounds;
        absoluteData.forEach((f: any) => f.bounds = boundsArray);
      } catch (e) {
        console.error("Failed to fetch bounds", e);
        absoluteData.forEach((f: any) => f.bounds = fallbackBounds);
      }
    }

    setFrames(absoluteData);
    setError(null);
    setLoading(false);
  };

  // Fetch initial data & Listen for Server-Sent Events (SSE)
  useEffect(() => {
    setLoading(true);
    const targetVariable = selectedVariable || "TIR1";
    
    // 1. Initial REST API Fetch (Bypasses any SSE proxy buffering delays)
    animationClient.getLatestFrames(targetVariable)
      .then(data => processFrames(data, targetVariable))
      .catch(err => {
        console.error("Initial fetch failed:", err);
        // Don't set error yet, let SSE try
      });

    // 2. Connect to the live stream
    const eventSource = new EventSource(`${BASE_URL}/animation/stream?variable=${targetVariable}`);
    
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await processFrames(data, targetVariable);
      } catch (err) {
        console.error("Failed to parse SSE animation frames", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Stream connection error", err);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedVariable, setFrames, setLoading, setError]);

  // Timer orchestration
  useEffect(() => {
    if (playing && filteredFrames.length > 0) {
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

    preloadImage(currentFrameIndex + 1);
    preloadImage(currentFrameIndex + 2);
  }, [currentFrameIndex, filteredFrames]);

  return null;
}
    };

    eventSource.onerror = (err) => {
      console.error("SSE Stream connection error", err);
      // EventSource auto-reconnects, but we can set a soft error if needed
    };

    return () => {
      // Close connection when unmounting or switching variables
      eventSource.close();
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


import React, { useRef, useState } from "react";
import { AnimationFrame } from "../types";

interface FrameTimelineProps {
  frames: AnimationFrame[];
  currentIndex: number;
  onJumpToFrame: (index: number) => void;
}

export function FrameTimeline({ frames, currentIndex, onJumpToFrame }: FrameTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateIndex = (clientX: number) => {
    if (!trackRef.current || frames.length === 0) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const index = Math.round(percentage * (frames.length - 1));
    return index;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    onJumpToFrame(calculateIndex(e.clientX));
    trackRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      onJumpToFrame(calculateIndex(e.clientX));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    trackRef.current?.releasePointerCapture(e.pointerId);
  };

  if (frames.length === 0) return null;

  const progressPercentage = frames.length > 1 ? (currentIndex / (frames.length - 1)) * 100 : 0;

  return (
    <div className="py-8 px-4 bg-card border rounded-lg shadow-sm">
      <div 
        className="relative h-2 bg-secondary rounded-full cursor-pointer"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Progress Fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150 ease-linear pointer-events-none"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Markers */}
        {frames.map((frame, idx) => {
          const leftPercent = frames.length > 1 ? (idx / (frames.length - 1)) * 100 : 0;
          const isActive = idx === currentIndex;
          return (
            <div 
              key={frame.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${leftPercent}%`, transform: `translate(-50%, -50%)` }}
            >
              <div 
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  isActive 
                    ? "bg-primary border-primary ring-4 ring-primary/20 scale-125" 
                    : "bg-background border-muted-foreground/50"
                }`}
              />
              <div className="absolute top-6 whitespace-nowrap text-xs font-medium text-muted-foreground">
                {frame.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

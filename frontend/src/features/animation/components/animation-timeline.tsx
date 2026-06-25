"use client";

import { useAnimationStore } from "@/store/animation-store";
import { Slider } from "@/components/ui/slider";

export function AnimationTimeline() {
  const { frames, currentFrameIndex, jumpToFrame } = useAnimationStore();
  const totalFrames = frames.length;

  if (totalFrames === 0) {
    return (
      <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800 opacity-50">
        <div className="h-4 bg-slate-800 rounded mb-2"></div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>No frames loaded</span>
        </div>
      </div>
    );
  }

  const currentFrame = frames[currentFrameIndex];
  
  return (
    <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col gap-3">
      <Slider
        value={[currentFrameIndex]}
        max={Math.max(0, totalFrames - 1)}
        step={1}
        onValueChange={(val: number[]) => jumpToFrame(val[0])}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400 font-mono">
        <span>Frame: {currentFrameIndex + 1} / {totalFrames}</span>
        <span>{currentFrame?.timestamp ? new Date(currentFrame.timestamp).toISOString() : 'N/A'}</span>
      </div>
    </div>
  );
}

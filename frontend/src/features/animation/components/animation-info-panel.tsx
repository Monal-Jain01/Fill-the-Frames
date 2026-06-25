"use client";

import { useAnimationStore } from "@/store/animation-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function AnimationInfoPanel() {
  const { frames, currentFrameIndex, selectedVariable } = useAnimationStore();
  const currentFrame = frames[currentFrameIndex];

  if (!currentFrame) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="py-3 px-4 border-b border-slate-800">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> Frame Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-500">
          No frames available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="py-3 px-4 border-b border-slate-800">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" /> Frame Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Frame ID</span>
          <span className="text-sm font-mono bg-slate-800 px-2 py-0.5 rounded truncate max-w-[150px]">
            {currentFrame.frameId}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Timestamp</span>
          <span className="text-sm font-mono text-blue-400">
            {new Date(currentFrame.timestamp).toISOString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Active Variable</span>
          <span className="text-sm font-medium">
            {currentFrame.variable || selectedVariable || "Default"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useAnimationStore } from "@/store/animation-store";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AnimationControls() {
  const { playing, play, pause, prevFrame, nextFrame, playbackSpeed, setSpeed, frames } = useAnimationStore();
  const disabled = frames.length === 0;

  return (
    <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevFrame} 
          disabled={disabled}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          variant={playing ? "default" : "outline"} 
          size="icon" 
          onClick={playing ? pause : play} 
          disabled={disabled}
          className={playing ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextFrame} 
          disabled={disabled}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Speed</span>
        <Select 
          value={playbackSpeed.toString()} 
          onValueChange={(val) => setSpeed(parseFloat(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-[80px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5x</SelectItem>
            <SelectItem value="1">1x</SelectItem>
            <SelectItem value="2">2x</SelectItem>
            <SelectItem value="4">4x</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

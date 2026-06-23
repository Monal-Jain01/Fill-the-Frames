import { Play, Pause, Square, SkipBack, SkipForward, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaybackState, AnimationSettings } from "../types";
import { ANIMATION_PLAYBACK_SPEEDS } from "../constants";

interface AnimationControlsProps {
  playbackState: PlaybackState;
  settings: AnimationSettings;
  totalFrames: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onUpdateSettings: (settings: Partial<AnimationSettings>) => void;
}

export function AnimationControls({
  playbackState,
  settings,
  totalFrames,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onUpdateSettings,
}: AnimationControlsProps) {
  const isPlaying = playbackState === "playing";
  const hasFrames = totalFrames > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={!hasFrames}
          title="Previous Frame"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        {isPlaying ? (
          <Button
            variant="default"
            size="icon"
            onClick={onPause}
            disabled={!hasFrames}
            title="Pause"
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPlay}
            disabled={!hasFrames}
            title="Play"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          disabled={!hasFrames || playbackState === "stopped"}
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={!hasFrames}
          title="Next Frame"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Speed:</span>
          <Select
            value={settings.playbackSpeed.toString()}
            onValueChange={(val) => onUpdateSettings({ playbackSpeed: parseFloat(val) })}
            disabled={!hasFrames}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_PLAYBACK_SPEEDS.map((speed) => (
                <SelectItem key={speed} value={speed.toString()}>
                  {speed}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant={settings.loopMode ? "secondary" : "outline"}
          size="icon"
          onClick={() => onUpdateSettings({ loopMode: !settings.loopMode })}
          title="Toggle Loop"
        >
          <Repeat className={`h-4 w-4 ${settings.loopMode ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
      </div>
    </div>
  );
}

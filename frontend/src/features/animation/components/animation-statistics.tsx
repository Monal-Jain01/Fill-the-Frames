import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimationSettings } from "../types";

interface AnimationStatisticsProps {
  totalFrames: number;
  currentFrameIndex: number;
  settings: AnimationSettings;
}

export function AnimationStatistics({ totalFrames, currentFrameIndex, settings }: AnimationStatisticsProps) {
  const duration = totalFrames > 0 ? (totalFrames / settings.fps).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Frames</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFrames}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">FPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{settings.fps}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{duration}s</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Frame</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFrames > 0 ? currentFrameIndex + 1 : 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{settings.playbackSpeed}x</div>
        </CardContent>
      </Card>
    </div>
  );
}

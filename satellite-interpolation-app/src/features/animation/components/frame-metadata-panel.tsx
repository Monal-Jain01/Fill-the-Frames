import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimationFrame } from "../types";

interface FrameMetadataPanelProps {
  frame: AnimationFrame | null;
}

export function FrameMetadataPanel({ frame }: FrameMetadataPanelProps) {
  if (!frame) return null;

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Frame Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Frame Label</div>
            <div className="font-medium">{frame.label}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Timestamp</div>
            <div className="font-medium">{new Date(frame.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })} UTC</div>
          </div>
          <div>
            <div className="text-muted-foreground">Interpolation Ratio</div>
            <div className="font-medium">{frame.interpolationRatio.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Resolution</div>
            <div className="font-medium">{frame.resolution}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Frame Type</div>
            <div className="mt-1">
              <Badge variant={frame.frameType === "observation" ? "default" : "secondary"}>
                {frame.frameType}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

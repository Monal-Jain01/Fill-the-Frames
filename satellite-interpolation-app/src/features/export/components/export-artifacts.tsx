import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportArtifactsProps {
  stats: {
    frames: number;
    animations: number;
    metrics: number;
    metadata: number;
  };
}

export function ExportArtifacts({ stats }: ExportArtifactsProps) {
  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Available Artifacts</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">{stats.frames}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Frames</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">{stats.animations}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Animations</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">{stats.metrics}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Metrics</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">{stats.metadata}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Metadata</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

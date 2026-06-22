import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportJob } from "../types";
import { Progress } from "@/components/ui/progress";

interface ExportQueueProps {
  activeJobs: ExportJob[];
  onCancel: (id: string) => void;
}

export function ExportQueue({ activeJobs, onCancel }: ExportQueueProps) {
  if (activeJobs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Export Queue</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {activeJobs.map((job) => (
          <div key={job.id} className="p-4 border rounded-lg bg-background">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  <span>{job.format} Export</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                    {job.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Started: {new Date(job.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <button 
                onClick={() => onCancel(job.id)}
                className="text-xs text-destructive hover:underline"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={job.progress} className="h-1.5 flex-1" />
              <span className="text-xs font-mono w-8 text-right">{job.progress.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

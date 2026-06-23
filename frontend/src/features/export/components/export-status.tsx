import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExportJob } from "../types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ExportStatusProps {
  activeJob?: ExportJob;
}

export function ExportStatusWidget({ activeJob }: ExportStatusProps) {
  if (!activeJob) return null;

  return (
    <Card className="border-primary/50 shadow-md bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {activeJob.status === "preparing" || activeJob.status === "exporting" ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : activeJob.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                Active Export: {activeJob.format}
              </h4>
              <p className="text-xs text-muted-foreground capitalize">
                Status: {activeJob.status}
              </p>
            </div>
          </div>
          <div className="text-sm font-bold text-primary">
            {activeJob.progress.toFixed(0)}%
          </div>
        </div>
        
        <Progress value={activeJob.progress} className="h-2" />
      </CardContent>
    </Card>
  );
}

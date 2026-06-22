import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportJob } from "../types";
import { Download, FileWarning, Clock } from "lucide-react";

interface ExportHistoryProps {
  historyJobs: ExportJob[];
}

export function ExportHistory({ historyJobs }: ExportHistoryProps) {
  if (historyJobs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Export History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {historyJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  job.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}>
                  {job.status === "completed" ? <Download className="h-4 w-4" /> : <FileWarning className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{job.format} Export</h4>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-2">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(job.createdAt).toLocaleString()}
                    </span>
                    {job.fileSize && (
                      <>
                        <span>•</span>
                        <span>{job.fileSize}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {job.status === "completed" && job.downloadUrl ? (
                <a 
                  href="#" // Mock URL
                  onClick={(e) => e.preventDefault()}
                  className="text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors font-medium"
                >
                  Download Ready
                </a>
              ) : (
                <span className="text-xs text-destructive font-medium capitalize">
                  {job.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

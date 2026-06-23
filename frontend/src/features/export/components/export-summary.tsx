import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export function ExportSummary() {
  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-50 border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-400" />
          <CardTitle className="text-xl">Export Workspace</CardTitle>
        </div>
        <CardDescription className="text-slate-300">
          Configure and download generated scientific outputs and visualizations.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

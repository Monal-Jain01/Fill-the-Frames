import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

export function AnimationSummary() {
  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-50 border-none shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-xl">Animation Workspace</CardTitle>
        </div>
        <CardDescription className="text-slate-300">
          Visualize the temporal evolution of satellite observations and interpolated frames.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

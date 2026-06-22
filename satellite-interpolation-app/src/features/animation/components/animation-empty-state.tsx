import { Card } from "@/components/ui/card";
import { ImageOff } from "lucide-react";

export function AnimationEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
      <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No Animation Data</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2">
        Upload satellite observations and generate interpolated frames to view the animation sequence.
      </p>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageOff } from 'lucide-react';

export function VisualizationEmptyState({
  message = "No Imagery Available",
  description = "Upload a satellite observation or select a frame to visualize."
}: { message?: string; description?: string }) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="rounded-full bg-secondary/50 p-4 mb-4 text-muted-foreground">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{message}</h3>
        <p className="text-muted-foreground max-w-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

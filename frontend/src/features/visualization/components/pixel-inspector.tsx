import React from 'react';
import { PixelData } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { MousePointer2 } from 'lucide-react';

interface PixelInspectorProps {
  pixel: PixelData;
}

export function PixelInspector({ pixel }: PixelInspectorProps) {
  const hasData = pixel.x !== null && pixel.y !== null && pixel.value !== null;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MousePointer2 className="w-5 h-5" />
          <span className="font-semibold">Pixel Inspector</span>
        </div>
        
        {hasData ? (
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">X Coordinate</span>
              <span className="font-mono">{pixel.x}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">Y Coordinate</span>
              <span className="font-mono">{pixel.y}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">Value (K)</span>
              <span className="font-mono text-primary font-bold">{pixel.value?.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">Hover over the image to inspect pixel values.</span>
        )}
      </CardContent>
    </Card>
  );
}

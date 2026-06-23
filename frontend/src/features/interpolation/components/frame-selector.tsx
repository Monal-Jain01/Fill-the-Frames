import React from 'react';
import { MockFrame } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/features/metadata/utils/formatters';
import { Clock, Maximize2 } from 'lucide-react';

interface FramePreviewCardProps {
  label: string;
  frame: MockFrame | null;
}

function FramePreviewCard({ label, frame }: FramePreviewCardProps) {
  return (
    <Card className="flex-1 bg-muted/10 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-md text-center">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {frame ? (
          <div className="space-y-3">
            <div className="w-full aspect-square bg-muted rounded flex items-center justify-center text-muted-foreground border">
              <span className="text-xs uppercase tracking-widest">{frame.id.split('-')[0]} Preview</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDate(frame.timestamp).split(',')[0]}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Maximize2 className="w-3 h-3" />
                <span>{frame.resolution}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-8">
            No frame selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FrameSelectorProps {
  t0: MockFrame | null;
  t1: MockFrame | null;
}

export function FrameSelector({ t0, t1 }: FrameSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl mx-auto">
      <FramePreviewCard label="T0 (Start Frame)" frame={t0} />
      <FramePreviewCard label="T1 (End Frame)" frame={t1} />
    </div>
  );
}

import React from 'react';
import { FrameInfo } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Satellite, Clock, Maximize2, Layers } from 'lucide-react';
import { formatDate } from '@/features/metadata/utils/formatters';

interface VisualizationSummaryCardsProps {
  info: FrameInfo;
}

export function VisualizationSummaryCards({ info }: VisualizationSummaryCardsProps) {
  const summaries = [
    { label: 'Resolution', value: info.resolution, icon: <Maximize2 className="w-4 h-4 text-emerald-500" /> },
    { label: 'Dimensions', value: `${info.dimensions[0]}x${info.dimensions[1]}`, icon: <Satellite className="w-4 h-4 text-blue-500" /> },
    { label: 'Band', value: info.band, icon: <Layers className="w-4 h-4 text-purple-500" /> },
    { label: 'Timestamp', value: formatDate(info.timestamp).split(',')[0], icon: <Clock className="w-4 h-4 text-amber-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaries.map((s, idx) => (
        <Card key={idx} className="bg-muted/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-background rounded-full">
              {s.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-sm font-semibold">{s.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

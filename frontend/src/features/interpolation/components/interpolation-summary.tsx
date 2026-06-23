import React from 'react';
import { InterpolationJobState } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Images, Clock, Activity, Target } from 'lucide-react';

interface InterpolationSummaryProps {
  jobState: InterpolationJobState;
}

export function InterpolationSummary({ jobState }: InterpolationSummaryProps) {
  if (jobState.status !== 'completed' || !jobState.completedAt || !jobState.startedAt) return null;

  const processingTime = ((new Date(jobState.completedAt).getTime() - new Date(jobState.startedAt).getTime()) / 1000).toFixed(1);

  const stats = [
    { label: 'Input Frames', value: '2', icon: <Images className="w-5 h-5 text-blue-500" /> },
    { label: 'Output Frames', value: '1', icon: <Target className="w-5 h-5 text-emerald-500" /> },
    { label: 'Interpolation Ratio', value: jobState.config.timeRatio.toString(), icon: <Activity className="w-5 h-5 text-purple-500" /> },
    { label: 'Processing Time', value: `${processingTime}s`, icon: <Clock className="w-5 h-5 text-amber-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="bg-muted/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-background rounded-full">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">{stat.label}</span>
              <span className="text-xl font-bold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import React from 'react';
import { ComparisonMode } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Image as ImageIcon, Map, Activity } from 'lucide-react';

interface ComparisonSummaryProps {
  mode: ComparisonMode;
}

export function ComparisonSummary({ mode }: ComparisonSummaryProps) {
  const stats = [
    { label: 'Input Frames', value: '2', icon: <Layers className="w-5 h-5 text-blue-500" /> },
    { label: 'Generated Frame', value: 'T0.5', icon: <ImageIcon className="w-5 h-5 text-emerald-500" /> },
    { label: 'Comparison Mode', value: mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: <Activity className="w-5 h-5 text-purple-500" /> },
    { label: 'Difference Regions', value: '1', icon: <Map className="w-5 h-5 text-amber-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="bg-muted/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-background rounded-full">
              {stat.icon}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs text-muted-foreground uppercase truncate">{stat.label}</span>
              <span className="text-lg font-bold truncate">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

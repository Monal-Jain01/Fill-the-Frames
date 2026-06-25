import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Globe, Clock, Maximize } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface MetadataInsightsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function MetadataInsights({ data }: MetadataInsightsProps) {
  // Use generic variables array if available, else empty
  const variables = data?.variables || [];
  const dimensions = data?.dimensions || [];

  const insights = [
    {
      title: 'Variables',
      value: variables.length.toString(),
      icon: <BrainCircuit className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'Dimensions',
      value: dimensions.length.toString(),
      icon: <Maximize className="w-5 h-5 text-purple-500" />,
    },
    {
      title: 'CRS Detected',
      value: data?.crs ? data.crs.split(' ')[0] : 'Unknown', // Simplify long CRS names
      icon: <Globe className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Timestamp',
      value: data?.timestamp ? formatDate(data.timestamp).split(',')[0] : 'N/A', // Show date part
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Spatial Coverage',
      value: data?.boundingBox ? `${Math.abs(data.boundingBox[2] - data.boundingBox[0])}° × ${Math.abs(data.boundingBox[3] - data.boundingBox[1])}°` : 'N/A',
      icon: <Maximize className="w-5 h-5 text-pink-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{insight.title}</span>
              {insight.icon}
            </div>
            <span className="text-2xl font-bold tracking-tight">{insight.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

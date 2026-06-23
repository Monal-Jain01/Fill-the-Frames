import React from 'react';
import { DetailedSatelliteMetadata } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Box, Globe, Clock, Maximize } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface MetadataInsightsProps {
  data: DetailedSatelliteMetadata;
}

export function MetadataInsights({ data }: MetadataInsightsProps) {
  const insights = [
    {
      title: 'Variables',
      value: data.variables.length.toString(),
      icon: <Layers className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'Dimensions',
      value: data.dimensions.length.toString(),
      icon: <Box className="w-5 h-5 text-purple-500" />,
    },
    {
      title: 'CRS Detected',
      value: data.crs.split(' ')[0], // Simplify long CRS names
      icon: <Globe className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Timestamp',
      value: formatDate(data.timestamp).split(',')[0], // Show date part
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Spatial Coverage',
      value: `${Math.abs(data.boundingBox[2] - data.boundingBox[0])}° × ${Math.abs(data.boundingBox[3] - data.boundingBox[1])}°`,
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

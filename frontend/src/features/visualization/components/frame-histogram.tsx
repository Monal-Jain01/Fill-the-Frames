"use client";

import React from 'react';
import { MockImageData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FrameHistogramProps {
  data: MockImageData;
}

export function FrameHistogram({ data }: FrameHistogramProps) {
  const chartData = data.histogram.map(bin => ({
    name: `${bin.binStart.toFixed(1)} - ${bin.binEnd.toFixed(1)}`,
    count: bin.count,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Pixel Value Distribution</span>
          <div className="text-sm font-normal flex gap-4 text-muted-foreground">
            <span>Min: <strong className="text-foreground">{data.min}</strong></span>
            <span>Max: <strong className="text-foreground">{data.max}</strong></span>
            <span>Mean: <strong className="text-foreground">{data.mean}</strong></span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

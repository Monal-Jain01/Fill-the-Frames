"use client";

import React from 'react';
import { MetricTrendPoint } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MetricsTrendChartProps {
  trendData: MetricTrendPoint[];
}

export function MetricsTrendChart({ trendData }: MetricsTrendChartProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
          Temporal Validation Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="frameId" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis domain={[0.8, 1.0]} yAxisId="left" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis domain={[0, 40]} yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              
              <Line yAxisId="left" type="monotone" dataKey="ssim" name="SSIM" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="left" type="monotone" dataKey="fsim" name="FSIM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="issm" name="ISSM" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              
              <Line yAxisId="right" type="monotone" dataKey="psnr" name="PSNR (dB)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

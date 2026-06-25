"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MetricsResponse } from '@/lib/api/validation-client';

interface MetricsChartsProps {
  metrics: MetricsResponse;
}

export function MetricsCharts({ metrics }: MetricsChartsProps) {
  // Filter metrics that map cleanly to a 0-1 radar chart (Structural/Information)
  const radarData = [
    { subject: 'SSIM', A: metrics.ssim, fullMark: 1.0 }
  ];
  if (metrics.fsim !== null) radarData.push({ subject: 'FSIM', A: metrics.fsim, fullMark: 1.0 });
  if (metrics.issm !== null) radarData.push({ subject: 'ISSM', A: metrics.issm, fullMark: 1.0 });

  // Filter signal metrics (PSNR, MSE) for a bar chart
  const barData = [
    { name: 'PSNR (dB)', value: metrics.psnr, statusColor: '#3b82f6' },
    { name: 'MSE', value: metrics.mse, statusColor: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-muted/5">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
            Structural & Info Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: '#666', fontSize: 10 }} />
                <Radar name="Generated T0.5" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/5">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
            Signal Error Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.statusColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

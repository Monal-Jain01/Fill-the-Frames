"use client";

import React from 'react';
import { MetricData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface MetricsChartsProps {
  metrics: MetricData[];
}

export function MetricsCharts({ metrics }: MetricsChartsProps) {
  // Filter metrics that map cleanly to a 0-1 radar chart (Structural/Information)
  const radarMetrics = metrics.filter(m => m.maxScore === 1.0);
  const radarData = radarMetrics.map(m => ({
    subject: m.type,
    A: m.value,
    fullMark: m.maxScore,
  }));

  // Filter signal metrics (PSNR, MSE) for a bar chart
  const barMetrics = metrics.filter(m => m.category === 'Signal');
  const barData = barMetrics.map(m => ({
    name: m.type,
    value: m.value,
    statusColor: m.status === 'excellent' ? '#10b981' : m.status === 'good' ? '#3b82f6' : m.status === 'acceptable' ? '#f59e0b' : '#ef4444',
  }));

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

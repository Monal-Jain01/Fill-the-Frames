"use client";

import React from 'react';
import { DetailedSatelliteMetadata } from '../types';
import { MetadataCard } from './metadata-card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MetadataSummaryProps {
  data: DetailedSatelliteMetadata;
}

export function MetadataSummary({ data }: MetadataSummaryProps) {
  // Format data for Dimension Sizes Chart
  const dimensionData = data.dimensions.map(dim => ({
    name: dim.name,
    size: dim.size,
  }));

  // Format data for Variable Data Ranges Chart (only variables with min/max)
  const rangeData = data.variables
    .filter(v => v.min !== undefined && v.max !== undefined)
    .map(v => ({
      name: v.name,
      min: v.min,
      max: v.max,
      range: [v.min, v.max] // For Custom Tooltip or custom rendering if needed
    }));

  return (
    <MetadataCard title="Summary Visualizations" description="Graphical overview of the dataset structure.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Dimensions Chart */}
        <div className="flex flex-col h-72">
          <h4 className="text-sm font-semibold mb-4 text-center">Dimension Sizes</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimensionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="size" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Size" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Variable Ranges Chart */}
        <div className="flex flex-col h-72">
          <h4 className="text-sm font-semibold mb-4 text-center">Variable Data Ranges (Min / Max)</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rangeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Legend />
                <Bar dataKey="min" fill="#3b82f6" name="Minimum" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#ef4444" name="Maximum" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MetadataCard>
  );
}

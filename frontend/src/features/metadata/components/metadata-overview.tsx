import React from 'react';
import { MetadataResponse } from '../types';
import { MetadataCard } from './metadata-card';
import { formatBytes, formatDate } from '../utils/formatters';

interface MetadataOverviewProps {
  data: MetadataResponse;
}

export function MetadataOverview({ data }: MetadataOverviewProps) {
  const details = [
    { label: 'File ID', value: data.file_id },
    { label: 'Filename', value: data.filename },
    { label: 'Format', value: data.format },
    { label: 'Start Time', value: data.temporal_info?.start_time ? formatDate(data.temporal_info.start_time) : 'N/A' },
    { label: 'End Time', value: data.temporal_info?.end_time ? formatDate(data.temporal_info.end_time) : 'N/A' },
    { label: 'File Size', value: formatBytes(data.size) },
    { label: 'Projection', value: data.coordinates?.projection || 'Unknown' },
  ];

  return (
    <MetadataCard title="File Overview" description="General properties of the uploaded observation.">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        {details.map((detail, idx) => (
          <div key={idx} className="flex flex-col">
            <dt className="text-sm font-medium text-muted-foreground">{detail.label}</dt>
            <dd className="text-sm font-semibold mt-1">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </MetadataCard>
  );
}

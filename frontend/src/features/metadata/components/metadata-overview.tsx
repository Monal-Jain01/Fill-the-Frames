import React from 'react';
import { DetailedSatelliteMetadata } from '../types';
import { MetadataCard } from './metadata-card';
import { formatBytes, formatDate } from '../utils/formatters';

interface MetadataOverviewProps {
  data: DetailedSatelliteMetadata;
}

export function MetadataOverview({ data }: MetadataOverviewProps) {
  const details = [
    { label: 'File ID', value: data.id },
    { label: 'Satellite', value: data.name },
    { label: 'Sensor', value: data.sensor },
    { label: 'Timestamp', value: formatDate(data.timestamp) },
    { label: 'Resolution', value: data.resolution },
    { label: 'File Size', value: formatBytes(data.fileSize) },
    { label: 'Coordinate System', value: data.crs },
    { label: 'Bounding Box', value: `[${data.boundingBox.join(', ')}]` },
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

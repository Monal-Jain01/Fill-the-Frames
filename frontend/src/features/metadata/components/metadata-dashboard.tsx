"use client";

import React from 'react';
import { useMetadata } from '../hooks/use-metadata';
import { MetadataInsights } from './metadata-insights';
import { MetadataOverview } from './metadata-overview';
import { MetadataTable, Column } from './metadata-table';
import { MetadataVariableList } from './metadata-variable-list';
import { MetadataSummary } from './metadata-summary';
import { MetadataEmptyState } from './metadata-empty-state';
import { DimensionDetail, CoordinateDetail } from '../types';
import { Skeleton } from '@/components/ui/skeleton';

export function MetadataDashboard() {
  const { data, state } = useMetadata();

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (state === 'error') {
    return <MetadataEmptyState message="Error Loading Metadata" description="There was a problem loading the observation metadata. Please try again." />;
  }

  if (state === 'empty' || !data) {
    return <MetadataEmptyState />;
  }

  const dimensionColumns: Column<DimensionDetail>[] = [
    { key: 'name', header: 'Dimension Name' },
    { key: 'size', header: 'Size' },
  ];

  const coordinateColumns: Column<CoordinateDetail>[] = [
    { key: 'name', header: 'Coordinate Name' },
    { key: 'dtype', header: 'Data Type' },
    { key: 'size', header: 'Size' },
    { 
      key: 'range', 
      header: 'Range [Min, Max]', 
      render: (item) => `[${item.range.join(', ')}]` 
    },
  ];

  return (
    <div className="space-y-6">
      <MetadataInsights data={data} />
      <MetadataOverview data={data} />
      <MetadataTable<DimensionDetail>
        title="Dimensions"
        description="Axes defining the shape of the data variables."
        data={data.dimensions}
        columns={dimensionColumns}
        keyExtractor={(item) => item.name}
      />
      <MetadataVariableList data={data} />
      <MetadataTable<CoordinateDetail>
        title="Coordinates"
        description="Physical coordinate mappings for the dimensions."
        data={data.coordinates}
        columns={coordinateColumns}
        keyExtractor={(item) => item.name}
      />
      <MetadataSummary data={data} />
    </div>
  );
}

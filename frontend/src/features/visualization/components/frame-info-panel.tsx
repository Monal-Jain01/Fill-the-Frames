import React from 'react';
import { FrameDataResponse } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/features/metadata/utils/formatters';

interface FrameInfoPanelProps {
  data: FrameDataResponse;
}

export function FrameInfoPanel({ data }: FrameInfoPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Detailed Frame Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Variable</dt>
            <dd className="font-medium">{data.variable}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Timestamp</dt>
            <dd className="font-medium">{data.timestamp ? formatDate(data.timestamp) : 'N/A'}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Time Index</dt>
            <dd className="font-medium">{data.time_index}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Dimensions</dt>
            <dd className="font-medium">{data.shape.join(' × ')} pixels</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Mean Value</dt>
            <dd className="font-medium">{data.mean.toFixed(2)}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Standard Deviation</dt>
            <dd className="font-medium">{data.std.toFixed(2)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

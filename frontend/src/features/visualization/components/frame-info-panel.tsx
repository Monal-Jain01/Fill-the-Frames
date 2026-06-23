import React from 'react';
import { FrameInfo } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/features/metadata/utils/formatters';

interface FrameInfoPanelProps {
  info: FrameInfo;
}

export function FrameInfoPanel({ info }: FrameInfoPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Detailed Frame Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Satellite</dt>
            <dd className="font-medium">{info.satellite}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Timestamp</dt>
            <dd className="font-medium">{formatDate(info.timestamp)}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Frame Type</dt>
            <dd className="font-medium">{info.frameType}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Band / Variable</dt>
            <dd className="font-medium">{info.band}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Dimensions</dt>
            <dd className="font-medium">{info.dimensions.join(' × ')} pixels</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-muted-foreground">Resolution</dt>
            <dd className="font-medium">{info.resolution}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export function MetricsPreview() {
  const placeholders = [
    { label: 'SSIM', value: 'Pending' },
    { label: 'FSIM', value: 'Pending' },
    { label: 'PSNR', value: 'Pending' },
    { label: 'MSE', value: 'Pending' },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Metrics Validation Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {placeholders.map((p, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-muted/20 rounded border">
              <span className="font-semibold text-sm text-muted-foreground">{p.label}</span>
              <span className="text-sm italic text-muted-foreground">{p.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Detailed metrics calculation and visualization will be handled by the upcoming Metrics Module.
        </p>
      </CardContent>
    </Card>
  );
}

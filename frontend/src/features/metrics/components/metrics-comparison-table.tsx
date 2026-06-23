import React from 'react';
import { MetricData } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ListFilter } from 'lucide-react';

interface MetricsComparisonTableProps {
  metrics: MetricData[];
}

export function MetricsComparisonTable({ metrics }: MetricsComparisonTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-md flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <ListFilter className="w-5 h-5" />
          Detailed Metric Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[150px]">Metric</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-semibold">{metric.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px] uppercase", CATEGORY_COLORS[metric.category])}>
                    {metric.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{metric.value.toFixed(3)}</TableCell>
                <TableCell>
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", STATUS_COLORS[metric.status])}>
                    {metric.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{metric.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportStatisticsProps {
  stats: {
    total: number;
    successful: number;
    failed: number;
    queueLength: number;
  };
}

export function ExportStatistics({ stats }: ExportStatisticsProps) {
  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Export Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Exports</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Successful</span>
            <span className="text-2xl font-bold text-green-500">{stats.successful}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Failed</span>
            <span className="text-2xl font-bold text-destructive">{stats.failed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Queue Length</span>
            <span className="text-2xl font-bold text-blue-500">{stats.queueLength}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

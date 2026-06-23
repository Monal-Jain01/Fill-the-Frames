import { PageHeader } from '@/components/common/page-header';
import { MetricsDashboard } from '@/features/metrics/components/metrics-dashboard';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Scientific Validation Metrics" 
        description="Quantify structural, signal, and information fidelity of generated frames." 
      />
      <MetricsDashboard />
    </div>
  );
}

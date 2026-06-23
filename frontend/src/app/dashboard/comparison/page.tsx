import { PageHeader } from '@/components/common/page-header';
import { ComparisonDashboard } from '@/features/comparison/components/comparison-dashboard';

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Scientific Comparison Workspace" 
        description="Evaluate interpolated satellite frames using visual and statistical analysis." 
      />
      <ComparisonDashboard />
    </div>
  );
}


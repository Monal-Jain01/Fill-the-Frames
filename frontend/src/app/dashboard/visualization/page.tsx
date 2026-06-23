import { PageHeader } from '@/components/common/page-header';
import { VisualizationDashboard } from '@/features/visualization/components/visualization-dashboard';

export default function VisualizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Scientific Visualization" 
        description="Inspect and analyze satellite imagery with interactive plotting tools." 
      />
      <VisualizationDashboard />
    </div>
  );
}

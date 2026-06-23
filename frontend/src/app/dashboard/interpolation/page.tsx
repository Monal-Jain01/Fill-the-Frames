import { PageHeader } from '@/components/common/page-header';
import { InterpolationDashboard } from '@/features/interpolation/components/interpolation-dashboard';

export default function InterpolationPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="AI Inference Workflow" 
        description="Configure and execute temporal interpolation to generate intermediate satellite frames." 
      />
      <InterpolationDashboard />
    </div>
  );
}


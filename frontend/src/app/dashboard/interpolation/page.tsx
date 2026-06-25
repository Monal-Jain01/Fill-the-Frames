import { PageHeader } from '@/components/common/page-header';
import { InterpolationWorkflowWrapper } from '@/features/interpolation/components/interpolation-workflow-wrapper';

export default function InterpolationPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="AI Interpolation Workflow" 
        description="Step-by-step pipeline to generate intermediate satellite frames." 
      />
      <InterpolationWorkflowWrapper />
    </div>
  );
}


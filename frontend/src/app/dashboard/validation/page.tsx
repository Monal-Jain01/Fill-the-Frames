import { PageHeader } from '@/components/common/page-header';
import { ValidationWorkflowWrapper } from '@/features/validation/components/validation-workflow-wrapper';

export default function ValidationPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Scientific Validation Workflow" 
        description="Evaluate and validate AI-generated frames against ground truth observations using visual and quantitative metrics." 
      />
      <ValidationWorkflowWrapper />
    </div>
  );
}

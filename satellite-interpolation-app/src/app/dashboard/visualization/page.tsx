import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function VisualizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Visualization" description="Manage visualization tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The visualization module is under development." />
      </SectionCard>
    </div>
  );
}

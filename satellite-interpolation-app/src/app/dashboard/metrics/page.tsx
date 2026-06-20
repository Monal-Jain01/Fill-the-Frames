import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Metrics" description="Manage metrics tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The metrics module is under development." />
      </SectionCard>
    </div>
  );
}

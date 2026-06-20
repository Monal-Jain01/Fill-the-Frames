import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Comparison" description="Manage comparison tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The comparison module is under development." />
      </SectionCard>
    </div>
  );
}

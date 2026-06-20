import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function InterpolationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Interpolation" description="Manage interpolation tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The interpolation module is under development." />
      </SectionCard>
    </div>
  );
}

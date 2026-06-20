import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="About" description="Manage about tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The about module is under development." />
      </SectionCard>
    </div>
  );
}

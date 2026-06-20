import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function AnimationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Animation" description="Manage animation tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The animation module is under development." />
      </SectionCard>
    </div>
  );
}

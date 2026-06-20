import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Export" description="Manage export tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The export module is under development." />
      </SectionCard>
    </div>
  );
}

import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function MetadataPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Metadata" description="Manage metadata tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The metadata module is under development." />
      </SectionCard>
    </div>
  );
}

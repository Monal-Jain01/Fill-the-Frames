import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { EmptyState } from '@/components/common/empty-state';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage settings tasks and settings." />
      <SectionCard>
        <EmptyState title="Coming Soon" description="The settings module is under development." />
      </SectionCard>
    </div>
  );
}

import { PageHeader } from '@/components/common/page-header';
import { MetadataDashboard } from '@/features/metadata/components/metadata-dashboard';

export default function MetadataPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Metadata Inspection" 
        description="Inspect metadata, variables, and dimensions of the current satellite observation." 
      />
      <MetadataDashboard />
    </div>
  );
}

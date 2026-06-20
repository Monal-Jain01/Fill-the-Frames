import { PageHeader } from '@/components/common/page-header';
import { UploadDropzone } from '@/features/upload/components/UploadDropzone';
import { UploadQueue } from '@/features/upload/components/UploadQueue';
import { UploadSummary } from '@/features/upload/components/UploadSummary';

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader 
        title="Upload Satellite Data" 
        description="Securely upload your INSAT-3D, GOES, or Himawari datasets for frame interpolation." 
      />
      
      <UploadSummary />
      <UploadDropzone />
      <UploadQueue />
    </div>
  );
}

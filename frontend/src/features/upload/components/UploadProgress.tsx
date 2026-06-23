import { Progress } from '@/components/ui/progress';
import { UploadStatus } from '@/store/upload-store';

export function UploadProgress({ progress, status }: { progress: number, status: UploadStatus }) {
  return (
    <div className="w-full h-1.5 overflow-hidden rounded-full bg-secondary">
      <Progress 
        value={progress} 
        className="h-full bg-secondary"
        indicatorClassName={status === 'completed' ? 'bg-green-500' : 'bg-primary transition-all duration-300'}
      />
    </div>
  );
}

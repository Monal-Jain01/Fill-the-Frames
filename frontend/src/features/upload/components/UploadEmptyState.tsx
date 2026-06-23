import { UploadCloud } from 'lucide-react';
import { ALLOWED_EXTENSIONS } from '../utils/file-validation';

export function UploadEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 pointer-events-none">
      <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
        <UploadCloud className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {isDragActive ? 'Drop your files here' : 'Drag & drop satellite data'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Support for continuous uploads. Select one or multiple NetCDF or HDF5 files to begin processing.
      </p>
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-md">
        <span>Supported:</span>
        {ALLOWED_EXTENSIONS.map(ext => (
          <span key={ext} className="text-foreground bg-background px-1.5 py-0.5 rounded border border-border">
            {ext}
          </span>
        ))}
      </div>
    </div>
  );
}

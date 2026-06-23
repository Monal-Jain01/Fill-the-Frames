'use client';

import { UploadFile, useUploadStore } from '@/store/upload-store';
import { File, AlertCircle, CheckCircle2, Play, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UploadProgress } from './UploadProgress';

export function UploadCard({ fileData }: { fileData: UploadFile }) {
  const { removeFile, simulateUpload } = useUploadStore();
  const { file, status, progress, error, fileType } = fileData;
  const fileSize = (file.size / (1024 * 1024)).toFixed(2);

  const getStatusIcon = () => {
    switch (status) {
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'uploading': return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default: return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-4 rounded-lg border bg-card flex items-center gap-4 transition-colors ${
        status === 'error' ? 'border-destructive/50 bg-destructive/5' : 'border-border'
      }`}
    >
      <div className="p-2 rounded-md bg-secondary flex-shrink-0">
        {getStatusIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium truncate pr-4">{file.name}</p>
          <div className="flex items-center gap-2">
            {fileType && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {fileType}
              </span>
            )}
          </div>
        </div>
        
        {status === 'error' ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{fileSize} MB</span>
            <span>{status === 'uploading' ? `${Math.round(progress)}%` : status}</span>
          </div>
        )}
        
        {['uploading', 'completed'].includes(status) && (
          <UploadProgress progress={progress} status={status} />
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {status === 'ready' && (
          <Button size="icon" variant="ghost" onClick={() => simulateUpload(fileData.id)} className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary">
            <Play className="h-4 w-4" />
          </Button>
        )}
        
        {status !== 'uploading' && (
          <Button size="icon" variant="ghost" onClick={() => removeFile(fileData.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadEmptyState } from './UploadEmptyState';
import { uploadClient } from '@/lib/api/upload-client';
import { cn } from '@/lib/utils';
import { Loader2, File, CheckCircle2, AlertCircle } from 'lucide-react';

export function UploadDropzone({ onUploadComplete }: { onUploadComplete?: (fileId: string, filename: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingFilename, setUploadingFilename] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadingFilename(file.name);
      setIsUploading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await uploadClient.uploadFile(file);
        
        if (response.success && response.data) {
          setSuccess(true);
          if (onUploadComplete) {
            onUploadComplete(response.data.file_id, response.data.filename);
          }
        } else {
          setError(response.message || "Failed to upload file");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled: isUploading || success,
    maxFiles: 1,
    accept: {
      'application/x-netcdf': ['.nc'],
      'application/x-hdf5': ['.h5', '.hdf5']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-xl transition-all cursor-pointer bg-card/50",
        isDragActive ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-border hover:border-primary/50 hover:bg-card",
        isDragReject && "border-destructive bg-destructive/5",
        (isUploading || success) && "cursor-default opacity-80"
      )}
    >
      <input {...getInputProps()} />
      
      {!isUploading && !error && !success && (
        <UploadEmptyState isDragActive={isDragActive} />
      )}

      {isUploading && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Uploading {uploadingFilename}...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center space-y-4 text-destructive">
          <AlertCircle className="w-12 h-12" />
          <p className="text-sm font-medium">{error}</p>
          <p className="text-xs text-muted-foreground">Click or drag to try again</p>
        </div>
      )}

      {success && (
        <div className="flex flex-col items-center justify-center space-y-4 text-green-500">
          <CheckCircle2 className="w-12 h-12" />
          <p className="text-sm font-medium">{uploadingFilename} Uploaded Successfully</p>
        </div>
      )}
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg transition-colors group-hover:border-primary"></div>
    </div>
  );
}

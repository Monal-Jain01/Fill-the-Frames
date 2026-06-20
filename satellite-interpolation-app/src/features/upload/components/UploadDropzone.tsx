'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadEmptyState } from './UploadEmptyState';
import { useUploadStore } from '@/store/upload-store';
import { cn } from '@/lib/utils';

export function UploadDropzone() {
  const addFiles = useUploadStore((state) => state.addFiles);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles);
    }
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
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
        isDragReject && "border-destructive bg-destructive/5"
      )}
    >
      <input {...getInputProps()} />
      <UploadEmptyState isDragActive={isDragActive} />
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg transition-colors group-hover:border-primary"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg transition-colors group-hover:border-primary"></div>
    </div>
  );
}

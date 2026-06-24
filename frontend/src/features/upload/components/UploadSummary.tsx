'use client';

// import { useUploadStore } from '@/store/upload-store';
import { Card, CardContent } from '@/components/ui/card';
import { File, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';

export function UploadSummary() {
  const files: { status: string; file: File }[] = [];
  
  if (files.length === 0) return null;

  const totalFiles = files.length;
  const validFiles = files.filter(f => f.status !== 'error').length;
  const errorFiles = files.filter(f => f.status === 'error').length;
  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0) / (1024 * 1024);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-secondary rounded-md text-muted-foreground"><File className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Files</p>
            <p className="text-xl font-bold">{totalFiles}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-md text-primary"><CheckCircle2 className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Ready / Uploading</p>
            <p className="text-xl font-bold">{validFiles}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-destructive/10 rounded-md text-destructive"><AlertCircle className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Invalid Files</p>
            <p className="text-xl font-bold">{errorFiles}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-secondary rounded-md text-muted-foreground"><HardDrive className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Size</p>
            <p className="text-xl font-bold">{totalSize.toFixed(2)} MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useUploadStore } from '@/store/upload-store';
import { UploadCard } from './UploadCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, PlayCircle } from 'lucide-react';

export function UploadQueue() {
  const { files, clearCompleted, simulateAllReady } = useUploadStore();

  if (files.length === 0) return null;

  const hasCompleted = files.some(f => f.status === 'completed');
  const hasReady = files.some(f => f.status === 'ready');

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upload Queue</h3>
        <div className="flex gap-2">
          {hasReady && (
            <Button size="sm" variant="outline" onClick={simulateAllReady} className="text-primary hover:text-primary">
              <PlayCircle className="h-4 w-4 mr-2" /> Start All
            </Button>
          )}
          {hasCompleted && (
            <Button size="sm" variant="ghost" onClick={clearCompleted} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Clear Completed
            </Button>
          )}
        </div>
      </div>
      
      <motion.div layout className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <UploadCard key={file.id} fileData={file} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

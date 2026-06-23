import React from 'react';
import { FrameSelector } from './frame-selector';
import { InterpolationJobState } from '../types';
import { Button } from '@/components/ui/button';
import { ArrowDown, Play } from 'lucide-react';

interface InterpolationWorkflowProps {
  jobState: InterpolationJobState;
  onGenerate: () => void;
}

export function InterpolationWorkflow({ jobState, onGenerate }: InterpolationWorkflowProps) {
  const isGenerating = jobState.status === 'preparing' || jobState.status === 'processing';
  const hasResult = jobState.status === 'completed';

  return (
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <FrameSelector t0={jobState.inputFrames.t0} t1={jobState.inputFrames.t1} />
      
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <ArrowDown className="w-6 h-6 animate-pulse" />
        
        <Button 
          size="lg" 
          onClick={onGenerate} 
          disabled={isGenerating || hasResult || !jobState.inputFrames.t0 || !jobState.inputFrames.t1}
          className="w-48 font-semibold shadow-lg"
        >
          {isGenerating ? (
            'Generating...'
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Frame
            </>
          )}
        </Button>
        
        {hasResult && <ArrowDown className="w-6 h-6 animate-pulse mt-2" />}
      </div>
    </div>
  );
}

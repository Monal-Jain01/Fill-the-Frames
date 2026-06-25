'use client';

import React from 'react';
import { useInterpolationStore } from '@/store/interpolation-store';
import { WorkflowStepper, Step } from '@/components/common/workflow-stepper';
import { UploadDropzone } from '@/features/upload/components/UploadDropzone';
import { MetadataOverview } from '@/features/metadata/components/metadata-overview';
import { InterpolationConfigPanel } from './interpolation-config-panel';
import { InterpolationTimeline } from './interpolation-timeline';
import { InterpolationStatus } from './interpolation-status';
import { InterpolationResultPreview } from './interpolation-result-preview';
import { Button } from '@/components/ui/button';
import { useMetadata } from '@/features/metadata/hooks/use-metadata';
import { MetadataResponse } from '@/features/metadata/types';
import { MetadataSummary } from '@/features/metadata/components/metadata-summary';
import { MetadataVariableList } from '@/features/metadata/components/metadata-variable-list';
import { Loader2 } from 'lucide-react';
import { useInterpolation } from '../hooks/use-interpolation';

export function InterpolationWorkflowWrapper() {
  const store = useInterpolationStore();
  const { startInterpolation } = useInterpolation();
  const { fetchInterpolationMetadata } = useMetadata();

  React.useEffect(() => {
    if (store.status === 'completed' && store.currentStep === 5) {
      store.nextStep();
    }
  }, [store.status, store.currentStep, store]);

  const handleT0Upload = async (fileId: string, filename: string) => {
    console.log("T0 Upload:", fileId, filename);
    store.setUploadState({
      t0FileId: fileId,
      t0Filename: filename,
    });

    
    await fetchInterpolationMetadata(fileId, 't0');
    store.nextStep();
  };

  const handleT1Upload = async (fileId: string, filename: string) => {
    store.setUploadState({
      t1FileId: fileId,
      t1Filename: filename,
    });

    
    await fetchInterpolationMetadata(fileId, 't1');
    store.nextStep();
  };

  const renderMetadata = (metadata: MetadataResponse | null, type: 'T0' | 'T1') => {
    if (store.metadataLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Extracting metadata...</p>
        </div>
      );
    }
    
    if (store.metadataError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-destructive">
          <p>Error extracting metadata: {store.metadataError}</p>
        </div>
      );
    }

    if (!metadata) return null;

    return (
      <div className="space-y-6">
        <MetadataOverview data={metadata} />
        <MetadataSummary data={metadata} />
        <MetadataVariableList data={metadata} />
        <div className="flex justify-center pt-4">
          <Button onClick={store.nextStep}>Proceed to {type === 'T0' ? 'T1 Upload' : 'Configuration'}</Button>
        </div>
      </div>
    );
  };

  const steps: Step[] = [
    {
      id: 1,
      label: 'Upload T0',
      description: 'First observation frame',
      component: (
        <div className="space-y-6">
          <UploadDropzone onUploadComplete={handleT0Upload} />
        </div>
      ),
    },
    {
      id: 2,
      label: 'Review T0',
      description: 'Review T0 Metadata',
      component: renderMetadata(store.t0Metadata, 'T0'),
    },
    {
      id: 3,
      label: 'Upload T1',
      description: 'Second observation frame',
      component: (
        <div className="space-y-6">
          <UploadDropzone onUploadComplete={handleT1Upload} />
        </div>
      ),
    },
    {
      id: 4,
      label: 'Review T1',
      description: 'Review T1 Metadata',
      component: renderMetadata(store.t1Metadata, 'T1'),
    },
    {
      id: 5,
      label: 'Process',
      description: 'Run Interpolation',
      component: (
        <div className="space-y-8 max-w-2xl mx-auto">
          <InterpolationConfigPanel 
            config={store.config} 
            onConfigChange={store.updateConfig} 
          />
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => startInterpolation()}
              disabled={store.status === 'processing'}
              className="w-48 font-semibold shadow-lg"
            >
              {store.status === 'processing' ? 'Generating...' : 'Generate T0.5 Frame'}
            </Button>
          </div>
          <InterpolationTimeline status={store.status} />
          <InterpolationStatus jobState={store} />
        </div>
      ),
    },
    {
      id: 6,
      label: 'Result',
      description: 'Generated T0.5',
      component: (
        <div className="space-y-6">
          <InterpolationResultPreview jobState={store} />
          <div className="flex justify-center gap-4">
             <Button variant="outline" onClick={() => {
                store.nextStep();
             }}>
               Review Export Options
             </Button>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      label: 'Export',
      description: 'Export Result',
      component: (
        <div className="space-y-6 flex flex-col items-center justify-center min-h-[300px]">
           <h2 className="text-2xl font-bold text-primary">Export Options</h2>
           <p className="text-muted-foreground">Download the generated T0.5 frame.</p>
           <Button size="lg" className="mt-4">Download .nc File</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <WorkflowStepper steps={steps} currentStep={store.currentStep} />
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="ghost" 
          onClick={store.prevStep} 
          disabled={store.currentStep === 1 || store.currentStep === 7}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

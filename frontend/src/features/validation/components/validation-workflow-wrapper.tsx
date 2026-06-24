'use client';

import React, { useState } from 'react';
import { useValidationStore } from '@/store/validation-store';
import { WorkflowStepper, Step } from '@/components/common/workflow-stepper';
import { UploadDropzone } from '@/features/upload/components/UploadDropzone';
import { MetadataOverview } from '@/features/metadata/components/metadata-overview';
import { ValidationViewer } from './validation-viewer';
import { DifferenceMapViewer } from '@/features/comparison/components/difference-map-viewer';
import { MetricsDashboard } from '@/features/metrics/components/metrics-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DifferenceMapData } from '@/features/comparison/types';

import { useMetadata } from '@/features/metadata/hooks/use-metadata';
import { MetadataSummary } from '@/features/metadata/components/metadata-summary';
import { MetadataVariableList } from '@/features/metadata/components/metadata-variable-list';
import { Loader2 } from 'lucide-react';

const dummyDifferenceMap: DifferenceMapData = {
  id: 'dummy',
  type: 'T0.5',
  timestamp: new Date().toISOString(),
  band: 'TIR1',
  resolution: '1km',
  dimensions: [0, 0],
  data: [],
  min: 0,
  max: 0,
  meanDifference: 0,
  maxDifference: 0,
  minDifference: 0,
  stdDeviation: 0,
  similarityScore: 0
};

export function ValidationWorkflowWrapper() {
  const store = useValidationStore();
  const { currentStep, nextStep, prevStep, setArtifactId, setGroundTruthFileId, setGroundTruthFilename } = store;
  const [tempArtifactId, setTempArtifactId] = useState('');
  const { fetchValidationMetadata } = useMetadata();

  const handleArtifactLoad = () => {
    setArtifactId(tempArtifactId);
    nextStep();
  };

  const handleGroundTruthUpload = async (fileId: string, filename: string) => {
    setGroundTruthFileId(fileId);
    setGroundTruthFilename(filename);
    nextStep();
    await fetchValidationMetadata(fileId);
  };

  const renderMetadata = () => {
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

    if (!store.groundTruthMetadata) return null;

    return (
      <div className="space-y-6">
        <MetadataOverview data={store.groundTruthMetadata} />
        <MetadataSummary data={store.groundTruthMetadata} />
        <MetadataVariableList data={store.groundTruthMetadata} />
        <div className="flex justify-center pt-4">
          <Button onClick={nextStep}>Proceed to Visual Inspection</Button>
        </div>
      </div>
    );
  };

  const steps: Step[] = [
    {
      id: 1,
      label: 'Load Artifact',
      description: 'Fetch Generated T0.5',
      component: (
        <div className="space-y-6 max-w-xl mx-auto flex flex-col items-center justify-center h-full min-h-[300px]">
          <h2 className="text-xl font-semibold">Load Generated Frame</h2>
          <p className="text-muted-foreground text-center">
            Enter the Artifact ID of the interpolated frame generated in the previous workflow.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="e.g. hf_artifact_9823" 
              value={tempArtifactId}
              onChange={(e) => setTempArtifactId(e.target.value)}
            />
            <Button onClick={handleArtifactLoad} disabled={!tempArtifactId}>Load</Button>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      label: 'Ground Truth',
      description: 'Upload Actual T0.5',
      component: (
        <div className="space-y-6">
          <UploadDropzone onUploadComplete={handleGroundTruthUpload} />
        </div>
      ),
    },
    {
      id: 3,
      label: 'Metadata',
      description: 'Review Observation',
      component: renderMetadata(),
    },
    {
      id: 4,
      label: 'Slider',
      description: 'AI vs Ground Truth',
      component: (
        <div className="space-y-6">
          <ValidationViewer 
            generatedImageUrl="/mock-images/generated.png" 
            groundTruthImageUrl="/mock-images/ground_truth.png" 
          />
          <div className="flex justify-center pt-4">
            <Button onClick={nextStep}>Analyze Difference Map</Button>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      label: 'Difference',
      description: 'Spatial Error Map',
      component: (
        <div className="space-y-6">
           <DifferenceMapViewer 
             differenceMap={dummyDifferenceMap}
             sharedLayout={{}}
             onRelayout={() => {}}
             isFullscreen={false}
           />
           <div className="flex justify-center pt-4">
            <Button onClick={nextStep}>Compute Metrics</Button>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      label: 'Metrics',
      description: 'Quantitative Analysis',
      component: (
        <div className="space-y-6">
           <MetricsDashboard />
           <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => console.log('Validation complete')}>
              Complete Validation
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <WorkflowStepper steps={steps} currentStep={currentStep} />
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="ghost" 
          onClick={prevStep} 
          disabled={currentStep === 1 || currentStep === 6}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

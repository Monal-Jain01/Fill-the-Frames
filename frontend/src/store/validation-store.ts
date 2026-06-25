import { create } from 'zustand';
import { MetadataResponse } from '@/features/metadata/types';
import { FrameDataResponse } from '@/features/visualization/types';
import { DifferenceMapData } from '@/features/comparison/types';
import { MetricsResponse } from '@/lib/api/validation-client';

interface ValidationState {
  currentStep: number;
  artifactId: string | null; // loaded generated T0.5
  groundTruthFileId: string | null;
  groundTruthFilename: string | null;
  metricsComputed: boolean;
  
  groundTruthMetadata: MetadataResponse | null;
  metadataLoading: boolean;
  metadataError: string | null;

  validationPair: { generatedId: string, groundTruthId: string } | null;
  alignedGenerated: FrameDataResponse | null;
  alignedGroundTruth: FrameDataResponse | null;
  differenceMap: DifferenceMapData | null;

  validationLoading: boolean;
  validationError: string | null;

  metrics: MetricsResponse | null;
  metricsLoading: boolean;
  metricsError: string | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setArtifactId: (id: string | null) => void;
  setGroundTruthFileId: (id: string | null) => void;
  setGroundTruthFilename: (filename: string | null) => void;
  setMetricsComputed: (computed: boolean) => void;
  setMetadataState: (state: Partial<Pick<ValidationState, 'groundTruthMetadata' | 'metadataLoading' | 'metadataError'>>) => void;
  setValidationState: (state: Partial<Pick<ValidationState, 'validationPair' | 'alignedGenerated' | 'alignedGroundTruth' | 'differenceMap' | 'validationLoading' | 'validationError'>>) => void;
  setMetricsState: (state: Partial<Pick<ValidationState, 'metrics' | 'metricsLoading' | 'metricsError'>>) => void;
  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  currentStep: 1,
  artifactId: null,
  groundTruthFileId: null,
  groundTruthFilename: null,
  metricsComputed: false,
  
  groundTruthMetadata: null,
  metadataLoading: false,
  metadataError: null,

  validationPair: null,
  alignedGenerated: null,
  alignedGroundTruth: null,
  differenceMap: null,
  validationLoading: false,
  validationError: null,

  metrics: null,
  metricsLoading: false,
  metricsError: null,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  setArtifactId: (id) => set({ artifactId: id }),
  setGroundTruthFileId: (id) => set({ groundTruthFileId: id }),
  setGroundTruthFilename: (filename) => set({ groundTruthFilename: filename }),
  setMetricsComputed: (computed) => set({ metricsComputed: computed }),
  setMetadataState: (newState) => set((state) => ({ ...state, ...newState })),
  setValidationState: (newState) => set((state) => ({ ...state, ...newState })),
  setMetricsState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () => set({
    currentStep: 1,
    artifactId: null,
    groundTruthFileId: null,
    groundTruthFilename: null,
    metricsComputed: false,
    groundTruthMetadata: null,
    metadataLoading: false,
    metadataError: null,
    validationPair: null,
    alignedGenerated: null,
    alignedGroundTruth: null,
    differenceMap: null,
    validationLoading: false,
    validationError: null,
    metrics: null,
    metricsLoading: false,
    metricsError: null,
  }),
}));

import { create } from 'zustand';
import { MetadataResponse } from '@/features/metadata/types';

interface ValidationState {
  currentStep: number;
  artifactId: string | null; // loaded generated T0.5
  groundTruthFileId: string | null;
  groundTruthFilename: string | null;
  metricsComputed: boolean;
  
  groundTruthMetadata: MetadataResponse | null;
  metadataLoading: boolean;
  metadataError: string | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setArtifactId: (id: string | null) => void;
  setGroundTruthFileId: (id: string | null) => void;
  setGroundTruthFilename: (filename: string | null) => void;
  setMetricsComputed: (computed: boolean) => void;
  setMetadataState: (state: Partial<Pick<ValidationState, 'groundTruthMetadata' | 'metadataLoading' | 'metadataError'>>) => void;
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

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  setArtifactId: (id) => set({ artifactId: id }),
  setGroundTruthFileId: (id) => set({ groundTruthFileId: id }),
  setGroundTruthFilename: (filename) => set({ groundTruthFilename: filename }),
  setMetricsComputed: (computed) => set({ metricsComputed: computed }),
  setMetadataState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () => set({
    currentStep: 1,
    artifactId: null,
    groundTruthFileId: null,
    groundTruthFilename: null,
    metricsComputed: false,
    groundTruthMetadata: null,
    metadataLoading: false,
    metadataError: null,
  }),
}));

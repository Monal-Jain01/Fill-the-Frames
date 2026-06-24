import { create } from 'zustand';
import { InterpolationJobState, InterpolationConfig } from '@/features/interpolation/types';
import { DEFAULT_INTERPOLATION_CONFIG } from '@/features/interpolation/constants';
import { FrameDataResponse } from '@/features/visualization/types';
import { MetadataResponse } from '@/features/metadata/types';

interface InterpolationState extends InterpolationJobState {
  currentStep: number;
  // Upload state
  t0FileId: string | null;
  t1FileId: string | null;
  t0Filename: string | null;
  t1Filename: string | null;
  
  // Metadata state
  t0Metadata: MetadataResponse | null;
  t1Metadata: MetadataResponse | null;
  metadataLoading: boolean;
  metadataError: string | null;
  
  // Visualization state
  selectedVariable: string | null;
  selectedTimeIndex: number;
  currentFrame: FrameDataResponse | null;
  availableVariables: string[];
  visLoading: boolean;
  visError: string | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setJobState: (state: Partial<InterpolationJobState>) => void;
  updateConfig: (config: Partial<InterpolationConfig>) => void;

  
  // Upload Actions
  setUploadState: (state: Partial<Pick<InterpolationState, 't0FileId' | 't1FileId' | 't0Filename' | 't1Filename'>>) => void;

  // Metadata Actions
  setMetadataState: (state: Partial<Pick<InterpolationState, 't0Metadata' | 't1Metadata' | 'metadataLoading' | 'metadataError'>>) => void;

  // Visualization Actions
  setVisState: (state: Partial<Pick<InterpolationState, 'selectedVariable' | 'selectedTimeIndex' | 'currentFrame' | 'availableVariables' | 'visLoading' | 'visError'>>) => void;
  
  reset: () => void;
}

const initialState: InterpolationJobState = {
  status: 'idle',
  progress: 0,
  config: DEFAULT_INTERPOLATION_CONFIG,
  outputFileId: null,
};

export const useInterpolationStore = create<InterpolationState>((set) => ({
  currentStep: 1,
  ...initialState,
  
  t0FileId: null,
  t1FileId: null,
  t0Filename: null,
  t1Filename: null,
  
  t0Metadata: null,
  t1Metadata: null,
  metadataLoading: false,
  metadataError: null,
  
  selectedVariable: null,
  selectedTimeIndex: 0,
  currentFrame: null,
  availableVariables: [],
  visLoading: false,
  visError: null,
  
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  
  setJobState: (newState) => set((state) => ({ ...state, ...newState })),
  
  updateConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  


  setUploadState: (newState) => set((state) => ({ ...state, ...newState })),

  setMetadataState: (newState) => set((state) => ({ ...state, ...newState })),

  setVisState: (newState) => set((state) => ({ ...state, ...newState })),

  reset: () => set({
    currentStep: 1,
    ...initialState,
    jobId: undefined,
    startedAt: undefined,
    completedAt: undefined,
    error: undefined,
    t0FileId: null,
    t1FileId: null,
    t0Filename: null,
    t1Filename: null,
    t0Metadata: null,
    t1Metadata: null,
    metadataLoading: false,
    metadataError: null,
    selectedVariable: null,
    selectedTimeIndex: 0,
    currentFrame: null,
    availableVariables: [],
    visLoading: false,
    visError: null,
  }),
}));


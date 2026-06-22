import { useState } from 'react';
import { InterpolationJobState, InterpolationConfig } from '../types';
import { DEFAULT_INTERPOLATION_CONFIG } from '../constants';
import { MOCK_FRAME_T0, MOCK_FRAME_T1 } from '../mock/data';
import { MockInterpolationService } from '../services/mock-api';

export function useInterpolation() {
  const [jobState, setJobState] = useState<InterpolationJobState>({
    status: 'idle',
    progress: 0,
    config: DEFAULT_INTERPOLATION_CONFIG,
    inputFrames: {
      t0: MOCK_FRAME_T0,
      t1: MOCK_FRAME_T1,
    },
    outputFrame: null,
  });

  const updateConfig = (newConfig: Partial<InterpolationConfig>) => {
    setJobState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  };

  const startInterpolation = async () => {
    if (!jobState.inputFrames.t0 || !jobState.inputFrames.t1) return;

    setJobState(prev => ({
      ...prev,
      status: 'preparing',
      progress: 0,
      jobId: `job-${Date.now()}`,
      startedAt: new Date().toISOString(),
      outputFrame: null,
      error: undefined,
    }));

    try {
      // Simulate status transition
      setTimeout(() => {
        setJobState(prev => prev.status === 'preparing' ? { ...prev, status: 'processing' } : prev);
      }, 1000);

      const result = await MockInterpolationService.generateFrame(
        jobState.inputFrames.t0.id,
        jobState.inputFrames.t1.id,
        jobState.config,
        (progress) => setJobState(prev => ({ ...prev, progress }))
      );

      setJobState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        outputFrame: result,
        completedAt: new Date().toISOString(),
      }));

    } catch {
      setJobState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to generate interpolation frame.',
        completedAt: new Date().toISOString(),
      }));
    }
  };

  const resetJob = () => {
    setJobState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      outputFrame: null,
      jobId: undefined,
      startedAt: undefined,
      completedAt: undefined,
      error: undefined,
    }));
  };

  return {
    jobState,
    updateConfig,
    startInterpolation,
    resetJob,
  };
}

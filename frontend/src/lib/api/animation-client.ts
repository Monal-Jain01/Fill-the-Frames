import { AnimationFrame } from '@/features/animation/types';
import { api } from './base-client';

export const animationClient = {
  getLatestFrames: async (variable: string = 'TIR1'): Promise<AnimationFrame[]> => {
    return api.get(`/animation/latest`, {
      params: { variable }
    });
  }
};

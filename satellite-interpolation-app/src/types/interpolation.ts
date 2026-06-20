export interface InterpolationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFrames: {
    t0: string; // observation ID
    t1: string; // observation ID
  };
  outputFrameId?: string; // observation ID of generated t0.5
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface InterpolationParameters {
  model: 'rife-tir' | 'rife-baseline';
  preserveMetadata: boolean;
  enhanceContrast: boolean;
}

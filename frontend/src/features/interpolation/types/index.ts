export type InterpolationStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'error';

export interface InterpolationConfig {
  timeRatio: 0.25 | 0.50 | 0.75;
  model: string;
  mode: string;
}

export interface MockFrame {
  id: string;
  timestamp: string;
  resolution: string;
  dimensions: [number, number];
  data: number[][];
  min: number;
  max: number;
}

export interface InterpolationJobState {
  jobId?: string;
  status: InterpolationStatus;
  progress: number; // 0 to 100
  startedAt?: string;
  completedAt?: string;
  config: InterpolationConfig;
  inputFrames: {
    t0: MockFrame | null;
    t1: MockFrame | null;
  };
  outputFrame: MockFrame | null;
  error?: string;
}

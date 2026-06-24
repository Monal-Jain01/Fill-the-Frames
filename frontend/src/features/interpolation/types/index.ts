export type InterpolationStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'error';

export interface InterpolationConfig {
  timeRatio: 0.25 | 0.50 | 0.75;
  model: string;
  mode: string;
  variable?: string;
}


export interface InterpolationJobState {
  jobId?: string;
  status: InterpolationStatus;
  progress: number; // 0 to 100
  startedAt?: string;
  completedAt?: string;
  config: InterpolationConfig;
  outputFileId: string | null;
  error?: string;
}

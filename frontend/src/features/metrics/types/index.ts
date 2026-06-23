export type MetricType = 'SSIM' | 'FSIM' | 'ISSM' | 'PSNR' | 'MSE';

export type MetricCategory = 'Structural' | 'Signal' | 'Information';

export type ValidationStatus = 'excellent' | 'good' | 'acceptable' | 'poor';

export interface MetricData {
  id: string;
  type: MetricType;
  category: MetricCategory;
  value: number;
  maxScore: number;
  status: ValidationStatus;
  description: string;
}

export interface MetricTrendPoint {
  frameId: string;
  ssim: number;
  fsim: number;
  psnr: number;
  mse: number;
  issm: number;
}

export interface BackendMetricsResponse {
  ssim: number;
  fsim: number;
  issm: number;
  psnr: number;
  mse: number;
  overallScore: number;
}

export interface ValidationInsights {
  bestMetric: MetricType;
  weakestMetric: MetricType;
  overallScore: number;
  status: ValidationStatus;
}

import { MetricData, MetricTrendPoint, ValidationInsights, BackendMetricsResponse } from '../types';

export const MOCK_BACKEND_RESPONSE: BackendMetricsResponse = {
  ssim: 0.942,
  fsim: 0.915,
  issm: 0.890,
  psnr: 34.2,
  mse: 14.5,
  overallScore: 92,
};

export const MOCK_METRICS_DATA: MetricData[] = [
  {
    id: 'm-ssim',
    type: 'SSIM',
    category: 'Structural',
    value: MOCK_BACKEND_RESPONSE.ssim,
    maxScore: 1.0,
    status: 'excellent',
    description: 'Structural Similarity Index Measure',
  },
  {
    id: 'm-fsim',
    type: 'FSIM',
    category: 'Structural',
    value: MOCK_BACKEND_RESPONSE.fsim,
    maxScore: 1.0,
    status: 'good',
    description: 'Feature Similarity Index Measure',
  },
  {
    id: 'm-issm',
    type: 'ISSM',
    category: 'Information',
    value: MOCK_BACKEND_RESPONSE.issm,
    maxScore: 1.0,
    status: 'acceptable',
    description: 'Information Theoretic Similarity Measure',
  },
  {
    id: 'm-psnr',
    type: 'PSNR',
    category: 'Signal',
    value: MOCK_BACKEND_RESPONSE.psnr,
    maxScore: 50.0, // Arbitrary max for display scale
    status: 'good',
    description: 'Peak Signal-to-Noise Ratio (dB)',
  },
  {
    id: 'm-mse',
    type: 'MSE',
    category: 'Signal',
    value: MOCK_BACKEND_RESPONSE.mse,
    maxScore: 100.0, // Arbitrary max for display scale
    status: 'good',
    description: 'Mean Squared Error',
  },
];

export const MOCK_TREND_DATA: MetricTrendPoint[] = [
  { frameId: 'T-1.0', ssim: 0.91, fsim: 0.88, psnr: 31.0, mse: 18.2, issm: 0.85 },
  { frameId: 'T-0.5', ssim: 0.92, fsim: 0.89, psnr: 32.5, mse: 16.5, issm: 0.86 },
  { frameId: 'T0.0', ssim: 0.93, fsim: 0.90, psnr: 33.1, mse: 15.8, issm: 0.88 },
  { frameId: 'T0.5', ssim: 0.942, fsim: 0.915, psnr: 34.2, mse: 14.5, issm: 0.89 },
  { frameId: 'T1.0', ssim: 0.935, fsim: 0.91, psnr: 33.8, mse: 15.0, issm: 0.885 },
];

export const MOCK_INSIGHTS: ValidationInsights = {
  bestMetric: 'SSIM',
  weakestMetric: 'ISSM',
  overallScore: MOCK_BACKEND_RESPONSE.overallScore,
  status: 'good',
};

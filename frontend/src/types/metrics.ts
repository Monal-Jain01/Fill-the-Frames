export interface ImageMetrics {
  ssim: number; // Structural Similarity Index Measure
  fsim: number; // Feature Similarity Index Measure
  issm: number; // Information Theoretic-based Statistic Similarity Measure
  psnr: number; // Peak Signal-to-Noise Ratio
  mse: number;  // Mean Squared Error
}

export interface ComparisonResult {
  id: string;
  frame1Id: string;
  frame2Id: string;
  metrics: ImageMetrics;
  generatedAt: string;
}

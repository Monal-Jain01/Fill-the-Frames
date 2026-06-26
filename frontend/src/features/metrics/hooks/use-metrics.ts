import { useState, useEffect } from 'react';
import { MetricData, MetricTrendPoint, ValidationInsights } from '../types';
import { MOCK_TREND_DATA, MOCK_INSIGHTS, MOCK_METRICS_DATA } from '../mock/data';
import { useValidationStore } from '@/store/validation-store';
import { metricsClient } from '@/lib/api/metrics-client';

export function useMetrics(truthFileIdProp?: string, generatedFileIdProp?: string) {
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [trend, setTrend] = useState<MetricTrendPoint[]>([]);
  const [insights, setInsights] = useState<ValidationInsights | null>(null);

  const validationStore = useValidationStore();

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsReady(false);
        
        let truthId = truthFileIdProp || validationStore.groundTruthFileId;
        let genId = generatedFileIdProp || validationStore.artifactId;

        if (truthId && genId) {
          const res = await metricsClient.compare({
            truth_file_id: truthId,
            generated_file_id: genId,
          });

          if (res) {
             const safeFixed = (val: unknown, digits: number) =>
               typeof val === 'number' ? Number(val.toFixed(digits)) : 0;
             const mData: MetricData[] = [
               { id: 'psnr', type: 'PSNR', category: 'Signal', value: safeFixed(res.psnr, 2), maxScore: 100, status: 'good', description: 'Peak Signal-to-Noise Ratio' },
               { id: 'ssim', type: 'SSIM', category: 'Structural', value: safeFixed(res.ssim, 4), maxScore: 1, status: 'good', description: 'Structural Similarity Index Measure' },
               { id: 'mse', type: 'MSE', category: 'Signal', value: safeFixed(res.mse, 4), maxScore: 0, status: 'acceptable', description: 'Mean Squared Error' },
             ];
             setMetrics(mData);
             setTrend(MOCK_TREND_DATA);
             setInsights(MOCK_INSIGHTS);
             setIsReady(true);
             return;
          }
        }

        // Fallback
        setMetrics(MOCK_METRICS_DATA);
        setTrend(MOCK_TREND_DATA);
        setInsights(MOCK_INSIGHTS);
        setIsReady(true);

      } catch (error) {
        console.error("Failed to fetch metrics", error);
        setMetrics(MOCK_METRICS_DATA);
        setTrend(MOCK_TREND_DATA);
        setInsights(MOCK_INSIGHTS);
        setIsReady(true);
      }
    };

    loadMetrics();
  }, [truthFileIdProp, generatedFileIdProp, validationStore.groundTruthFileId, validationStore.artifactId]);

  return {
    isReady,
    metrics,
    trend,
    insights,
  };
}
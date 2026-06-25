import { useState, useEffect } from 'react';
import { MetricData, MetricTrendPoint, ValidationInsights } from '../types';
import { MOCK_TREND_DATA, MOCK_INSIGHTS, MOCK_METRICS_DATA } from '../mock/data';
import { useUploadStore } from '@/store/upload-store';
import { metricsClient } from '@/lib/api';

export function useMetrics(truthFileIdProp?: string, generatedFileIdProp?: string) {
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [trend, setTrend] = useState<MetricTrendPoint[]>([]);
  const [insights, setInsights] = useState<ValidationInsights | null>(null);

  const files = useUploadStore(state => state.files);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsReady(false);
        
        let truthId = truthFileIdProp;
        let genId = generatedFileIdProp;

        if (!truthId || !genId) {
           const completedFiles = files.filter(f => f.status === 'completed' && f.cloudFileId);
           if (completedFiles.length >= 2) {
             truthId = completedFiles[0].cloudFileId;
             genId = completedFiles[1].cloudFileId;
           }
        }

        if (truthId && genId) {
          const res = await metricsClient.compare({
            truth_file_id: truthId,
            generated_file_id: genId,
          });

          if (res.success && res.data) {
             const mData: MetricData[] = [
               { id: 'psnr', type: 'PSNR', category: 'Signal', value: Number(res.data.psnr?.toFixed(2)) || 0, maxScore: 100, status: 'good', description: 'Peak Signal-to-Noise Ratio' },
               { id: 'ssim', type: 'SSIM', category: 'Structural', value: Number(res.data.ssim?.toFixed(4)) || 0, maxScore: 1, status: 'good', description: 'Structural Similarity Index Measure' },
               { id: 'mse', type: 'MSE', category: 'Signal', value: Number(res.data.mse?.toFixed(4)) || 0, maxScore: 0, status: 'acceptable', description: 'Mean Squared Error' },
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
  }, [truthFileIdProp, generatedFileIdProp, files]);

  return {
    isReady,
    metrics,
    trend,
    insights,
  };
}
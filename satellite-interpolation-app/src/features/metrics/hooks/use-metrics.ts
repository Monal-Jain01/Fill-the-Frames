import { useState, useEffect } from 'react';
import { MetricData, MetricTrendPoint, ValidationInsights } from '../types';
import { MOCK_METRICS_DATA, MOCK_TREND_DATA, MOCK_INSIGHTS } from '../mock/data';

export function useMetrics() {
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [trend, setTrend] = useState<MetricTrendPoint[]>([]);
  const [insights, setInsights] = useState<ValidationInsights | null>(null);

  useEffect(() => {
    // Simulate data loading from backend
    const timer = setTimeout(() => {
      setMetrics(MOCK_METRICS_DATA);
      setTrend(MOCK_TREND_DATA);
      setInsights(MOCK_INSIGHTS);
      setIsReady(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return {
    isReady,
    metrics,
    trend,
    insights,
  };
}

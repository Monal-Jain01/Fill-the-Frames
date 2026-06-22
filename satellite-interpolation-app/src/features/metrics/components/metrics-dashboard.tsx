"use client";

import React from 'react';
import { useMetrics } from '../hooks/use-metrics';
import { OverallQualityScore } from './overall-quality-score';
import { MetricsSummary } from './metrics-summary';
import { MetricsCards } from './metrics-cards';
import { MetricsCharts } from './metrics-charts';
import { MetricsTrendChart } from './metrics-trend-chart';
import { MetricsComparisonTable } from './metrics-comparison-table';
import { MetricsInsights } from './metrics-insights';
import { MetricDefinitions } from './metric-definitions';
import { MetricsEmptyState } from './metrics-empty-state';
import { motion } from 'framer-motion';

export function MetricsDashboard() {
  const { isReady, metrics, trend, insights } = useMetrics();

  if (!isReady || !insights) {
    return <MetricsEmptyState />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10 max-w-6xl mx-auto"
    >
      <OverallQualityScore insights={insights} />
      
      <MetricsSummary />
      
      <MetricsCards metrics={metrics} />
      
      <MetricsCharts metrics={metrics} />
      
      <MetricsTrendChart trendData={trend} />
      
      <MetricsComparisonTable metrics={metrics} />
      
      <MetricsInsights insights={insights} />
      
      <MetricDefinitions />

    </motion.div>
  );
}

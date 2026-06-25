"use client";

import React from 'react';
import { useValidationStore } from '@/store/validation-store';
import { OverallQualityScore } from './overall-quality-score';
import { MetricsCards } from './metrics-cards';
import { MetricsCharts } from './metrics-charts';
import { MetricDefinitions } from './metric-definitions';
import { MetricsEmptyState } from './metrics-empty-state';
import { motion } from 'framer-motion';

export function MetricsDashboard() {
  const { metrics, metricsLoading, metricsError } = useValidationStore();

  if (metricsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Calculating Scientific Quality Metrics...</p>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 max-w-4xl mx-auto mt-8">
        <h3 className="font-semibold text-lg mb-2">Metrics Calculation Failed</h3>
        <p>{metricsError}</p>
      </div>
    );
  }

  if (!metrics) {
    return <MetricsEmptyState />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10 max-w-6xl mx-auto"
    >
      <OverallQualityScore metrics={metrics} />
      
      <MetricsCards metrics={metrics} />
      
      <MetricsCharts metrics={metrics} />
      
      <MetricDefinitions />

    </motion.div>
  );
}

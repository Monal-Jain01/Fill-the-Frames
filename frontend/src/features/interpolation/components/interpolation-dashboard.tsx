"use client";

import React from 'react';
import { useInterpolation } from '../hooks/use-interpolation';
import { InterpolationSummary } from './interpolation-summary';
import { InterpolationWorkflow } from './interpolation-workflow';
import { InterpolationConfigPanel } from './interpolation-config-panel';
import { InterpolationTimeline } from './interpolation-timeline';
import { InterpolationStatus } from './interpolation-status';
import { InterpolationResultPreview } from './interpolation-result-preview';
import { InterpolationValidationPlaceholder } from './interpolation-validation-placeholder';
import { motion } from 'framer-motion';

export function InterpolationDashboard() {
  const { jobState, updateConfig, startInterpolation } = useInterpolation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10 max-w-5xl mx-auto"
    >
      <InterpolationSummary jobState={jobState} />
      
      <InterpolationWorkflow 
        jobState={jobState} 
        onGenerate={startInterpolation} 
      />
      
      <InterpolationConfigPanel 
        config={jobState.config} 
        onConfigChange={updateConfig}
        disabled={jobState.status !== 'idle' && jobState.status !== 'completed'}
      />
      
      <div className="pt-4">
        <InterpolationTimeline status={jobState.status} />
      </div>

      <InterpolationStatus jobState={jobState} />

      {jobState.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
          className="space-y-6 pt-4"
        >
          <InterpolationResultPreview jobState={jobState} />
          <InterpolationValidationPlaceholder jobState={jobState} />
        </motion.div>
      )}
    </motion.div>
  );
}

import { ValidationStatus, MetricCategory } from '../types';

export const STATUS_COLORS: Record<ValidationStatus, string> = {
  excellent: 'text-emerald-500',
  good: 'text-blue-500',
  acceptable: 'text-amber-500',
  poor: 'text-destructive',
};

export const STATUS_BG_COLORS: Record<ValidationStatus, string> = {
  excellent: 'bg-emerald-500/10 border-emerald-500/20',
  good: 'bg-blue-500/10 border-blue-500/20',
  acceptable: 'bg-amber-500/10 border-amber-500/20',
  poor: 'bg-destructive/10 border-destructive/20',
};

export const CATEGORY_COLORS: Record<MetricCategory, string> = {
  Structural: 'text-indigo-500 bg-indigo-500/10',
  Signal: 'text-rose-500 bg-rose-500/10',
  Information: 'text-cyan-500 bg-cyan-500/10',
};

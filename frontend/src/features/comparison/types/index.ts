export type ComparisonState = 'empty' | 'loading' | 'ready' | 'error';

export type FrameType = 'T0' | 'T0.5' | 'T1' | 'GroundTruth';

export type ComparisonMode = 'side-by-side' | 'three-frame' | 'split-view' | 'difference-map';

export interface ComparisonFrame {
  id: string;
  type: FrameType;
  timestamp: string;
  band: string;
  resolution: string;
  dimensions: [number, number];
  data: number[][];
  min: number;
  max: number;
}

export interface DifferenceMapData extends ComparisonFrame {
  meanDifference: number;
  maxDifference: number;
  minDifference: number;
  stdDeviation: number;
  similarityScore: number;
}

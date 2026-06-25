export type VisualizationState = 'empty' | 'loading' | 'ready' | 'error';

export type FrameType = 'T0' | 'T0.5' | 'T1';

export type ColorMap = 'Thermal' | 'Inferno' | 'Plasma' | 'Turbo' | 'Grayscale';

export interface FrameInfo {
  satellite: string;
  timestamp: string;
  resolution: string;
  dimensions: [number, number]; // [width, height]
  band: string;
  frameType: FrameType;
}

export interface PixelData {
  x: number | null;
  y: number | null;
  value: number | null;
  colormapValue: string | null;
}

export interface FrameStatistics {
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface FrameDataResponse {
  file_id: string;
  variable: string;
  time_index: number;
  timestamp: string | null;
  shape: [number, number];
  min: number;
  max: number;
  mean: number;
  std: number;
  z: number[][];
}

export interface MockImageData {
  z: number[][]; // 2D array of pixel values
  min: number;
  max: number;
  mean: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
  info: FrameInfo;
}

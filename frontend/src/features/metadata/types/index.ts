import { SatelliteMetadata } from '@/types/satellite';

export type MetadataState = 'empty' | 'loading' | 'ready' | 'error';

export interface VariableDetail {
  name: string;
  dtype: string;
  dimensions: string[];
  attributes: Record<string, string | number>;
  min?: number;
  max?: number;
  mean?: number;
}

export interface DimensionDetail {
  name: string;
  size: number;
}

export interface CoordinateDetail {
  name: string;
  dtype: string;
  size: number;
  range: [number, number];
}

export interface DetailedSatelliteMetadata extends Omit<SatelliteMetadata, 'variables'> {
  fileSize: number; // in bytes
  dimensions: DimensionDetail[];
  variables: VariableDetail[];
  coordinates: CoordinateDetail[];
}

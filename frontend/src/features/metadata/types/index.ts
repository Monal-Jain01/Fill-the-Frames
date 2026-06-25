export type MetadataState = 'empty' | 'loading' | 'ready' | 'error';

export interface DimensionInfo {
  name: string;
  size: number;
}

export interface VariableInfo {
  name: string;
  datatype: string;
  dimensions: string[];
  shape: number[];
  attributes: Record<string, unknown>;
  min_value?: number;
  max_value?: number;
}

export interface CoordinateInfo {
  latitude?: string;
  longitude?: string;
  projection?: string;
}

export interface TemporalInfo {
  start_time?: string;
  end_time?: string;
  time_steps?: number;
}

export interface DatasetSummary {
  file_format: string;
  variable_count: number;
  dimension_count: number;
  coordinate_count: number;
  dataset_size: number;
}

export interface MetadataResponse {
  file_id: string;
  filename: string;
  size: number;
  format: string;
  global_attributes: Record<string, unknown>;
  dimensions: DimensionInfo[];
  variables: VariableInfo[];
  coordinates: CoordinateInfo;
  temporal_info: TemporalInfo;
  summary: DatasetSummary;
}

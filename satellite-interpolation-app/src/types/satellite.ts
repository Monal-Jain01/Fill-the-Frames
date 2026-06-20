export interface SatelliteMetadata {
  id: string;
  name: string;
  sensor: string;
  timestamp: string;
  resolution: string;
  crs: string;
  boundingBox: [number, number, number, number];
  variables: string[];
}

export interface SatelliteObservation {
  id: string;
  metadata: SatelliteMetadata;
  url: string;
  format: 'netcdf' | 'hdf5';
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  uploadProgress?: number;
}

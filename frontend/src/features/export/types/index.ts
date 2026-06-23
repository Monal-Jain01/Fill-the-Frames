export type ExportFormat = "NetCDF" | "PNG" | "GIF" | "MP4";
export type ExportStatus = "idle" | "preparing" | "exporting" | "completed" | "error";

export interface ExportOptions {
  format: ExportFormat;
  resolution: "original" | "1080p" | "720p";
  includeMetadata: boolean;
  includeMetrics: boolean;
  includeAnimation: boolean;
}

export interface ExportJob {
  id: string;
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: string;
}

// Future backend compatibility
export interface BackendExportJobResponse {
  jobId: string;
  status: string;
  progress: number;
  downloadUrl: string;
}

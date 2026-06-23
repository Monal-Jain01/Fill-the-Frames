import { ExportFormat, ExportOptions } from "../types";

export const EXPORT_CATEGORIES = {
  Scientific: ["NetCDF"] as ExportFormat[],
  Visualization: ["PNG", "GIF", "MP4"] as ExportFormat[],
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "MP4",
  resolution: "1080p",
  includeMetadata: true,
  includeMetrics: false,
  includeAnimation: true,
};

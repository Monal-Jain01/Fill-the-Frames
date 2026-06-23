import { ExportJob } from "../types";

export const MOCK_EXPORT_HISTORY: ExportJob[] = [
  {
    id: "job-101",
    format: "NetCDF",
    status: "completed",
    progress: 100,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    completedAt: new Date(Date.now() - 86390000).toISOString(),
    downloadUrl: "https://mock-download.example.com/file.nc",
    fileSize: "45.2 MB",
  },
  {
    id: "job-102",
    format: "GIF",
    status: "completed",
    progress: 100,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    completedAt: new Date(Date.now() - 3590000).toISOString(),
    downloadUrl: "https://mock-download.example.com/animation.gif",
    fileSize: "12.8 MB",
  },
  {
    id: "job-103",
    format: "MP4",
    status: "error",
    progress: 35,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    fileSize: "0 MB",
  },
];

export const MOCK_ARTIFACT_STATS = {
  frames: 5,
  animations: 1,
  metrics: 12,
  metadata: 1,
};

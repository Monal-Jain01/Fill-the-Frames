import { useState, useCallback, useRef } from "react";
import { ExportJob, ExportOptions } from "../types";
import { DEFAULT_EXPORT_OPTIONS } from "../constants";
import { MOCK_EXPORT_HISTORY } from "../mock/data";

export function useExport() {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [jobs, setJobs] = useState<ExportJob[]>(MOCK_EXPORT_HISTORY);
  
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const startExport = useCallback(() => {
    const newJobId = `job-${Date.now()}`;
    
    const newJob: ExportJob = {
      id: newJobId,
      format: options.format,
      status: "preparing",
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);

    // Simulate export progress
    let currentProgress = 0;
    
    const timer = setInterval(() => {
      currentProgress += Math.random() * 15; // Random jump between 0 and 15%
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timerRefs.current[newJobId]);
        delete timerRefs.current[newJobId];
        
        setJobs((prev) => 
          prev.map((job) => 
            job.id === newJobId 
              ? { 
                  ...job, 
                  status: "completed", 
                  progress: 100, 
                  completedAt: new Date().toISOString(),
                  downloadUrl: `https://mock-download.example.com/export_${Date.now()}.${options.format.toLowerCase()}`,
                  fileSize: `${(Math.random() * 50 + 5).toFixed(1)} MB`
                } 
              : job
          )
        );
      } else {
        setJobs((prev) => 
          prev.map((job) => 
            job.id === newJobId 
              ? { 
                  ...job, 
                  status: currentProgress > 10 ? "exporting" : "preparing", 
                  progress: currentProgress 
                } 
              : job
          )
        );
      }
    }, 1000);

    timerRefs.current[newJobId] = timer;
  }, [options]);

  const cancelExport = useCallback((jobId: string) => {
    if (timerRefs.current[jobId]) {
      clearInterval(timerRefs.current[jobId]);
      delete timerRefs.current[jobId];
      
      setJobs((prev) => 
        prev.map((job) => 
          job.id === jobId 
            ? { ...job, status: "error", progress: job.progress } 
            : job
        )
      );
    }
  }, []);

  const updateOptions = useCallback((newOptions: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === "preparing" || j.status === "exporting");
  const historyJobs = jobs.filter((j) => j.status === "completed" || j.status === "error");

  const stats = {
    total: jobs.length,
    successful: jobs.filter(j => j.status === "completed").length,
    failed: jobs.filter(j => j.status === "error").length,
    queueLength: activeJobs.length,
  };

  return {
    options,
    jobs,
    activeJobs,
    historyJobs,
    stats,
    startExport,
    cancelExport,
    updateOptions,
  };
}

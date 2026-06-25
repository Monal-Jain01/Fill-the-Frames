import { useState, useRef, useEffect } from 'react';
import { InterpolationJobState, InterpolationConfig } from '../types';
import { DEFAULT_INTERPOLATION_CONFIG } from '../constants';
import { interpolationClient, BASE_URL } from '@/lib/api';

export function useInterpolation() {
  const [jobState, setJobState] = useState<InterpolationJobState>({
    status: 'idle',
    progress: 0,
    config: DEFAULT_INTERPOLATION_CONFIG,
    inputFrames: {
      t0: null, // 🚨 Note: Ab default mock data hata diya hai
      t1: null,
    },
    outputFrame: null,
  });

  // Reference to hold the EventSource so we can close it if user leaves the page
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const updateConfig = (newConfig: Partial<InterpolationConfig>) => {
    setJobState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  };

  const setInputFrame = (key: 't0' | 't1', id: string, filename: string) => {
    setJobState(prev => ({
      ...prev,
      inputFrames: {
        ...prev.inputFrames,
        [key]: { 
          id: id, 
          filename: filename, 
          timestamp: new Date().toISOString(), // UI ke liye dummy date
          resolution: 'Metadata Pending' // UI me crash roken ke liye
        }
      }
    }));
  };

  const startInterpolation = async () => {
    // Check if user has actually selected files
    const t0Id = jobState.inputFrames.t0?.id; 
    const t1Id = jobState.inputFrames.t1?.id;

    if (!t0Id || !t1Id) {
      alert("Bhai, pehle 2 files select karo interpolation ke liye!");
      return;
    }

    setJobState(prev => ({
      ...prev,
      status: 'preparing',
      progress: 0,
      startedAt: new Date().toISOString(),
      outputFrame: null,
      error: undefined,
    }));

    try {
      // 1. Backend API Call to Queue Job
      const res = await interpolationClient.generate(t0Id, t1Id, jobState.config.variable || "C13");
      
      if (!res.success) throw new Error(res.message);

      const jobId = res.data.job_id || res.data.jobId;
      setJobState(prev => ({ ...prev, status: 'processing', jobId }));

      // 2. Open Server-Sent Events (SSE) Stream
      const sseUrl = `${BASE_URL}${interpolationClient.getEventsUrl(jobId)}`;
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      // 3. Listen to Live Progress
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          setJobState(prev => ({ ...prev, status: 'error', error: data.error }));
          eventSource.close();
          return;
        }

        setJobState(prev => ({ 
          ...prev, 
          progress: data.progress, 
          status: data.status 
        }));

        // Agar job khatam ho gayi (pass ya fail)
        if (data.status === 'completed' || data.status === 'failed') {
          if (data.status === 'completed') {
            setJobState(prev => ({
              ...prev,
              outputFrame: {
                id: data.result_file_id,
                timestamp: new Date().toISOString(),
                resolution: 'Generated',
                dimensions: [0, 0],
                data: [],
                min: 0,
                max: 0
              } as any, // Cast as any because we just need the ID to pass to other views now
              completedAt: new Date().toISOString()
            }));
          }
          eventSource.close(); // Stream band karo taaki loop na chale
        }
      };

      eventSource.onerror = () => {
        console.error("SSE connection lost!");
        setJobState(prev => ({ ...prev, status: 'error', error: 'Connection to server lost. Still processing in cloud.' }));
        eventSource.close();
      };

    } catch (error: any) {
      setJobState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to generate interpolation frame.',
        completedAt: new Date().toISOString(),
      }));
    }
  };

  const resetJob = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setJobState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      outputFrame: null,
      jobId: undefined,
      startedAt: undefined,
      completedAt: undefined,
      error: undefined,
    }));
  };

  return {
    jobState,
    updateConfig,
    startInterpolation,
    resetJob,
    setInputFrame, // 🚨 Yeh naya add kiya hai
  };
}
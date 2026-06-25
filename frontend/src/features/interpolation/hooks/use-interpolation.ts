import { useRef, useEffect } from 'react';
import { useInterpolationStore } from '@/store/interpolation-store';
import { useValidationStore } from '@/store/validation-store';
import { interpolationClient } from '@/lib/api/interpolation-client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function useInterpolation() {
  const store = useInterpolationStore();
  const validationStore = useValidationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startInterpolation = async () => {
    const t0Id = store.t0FileId;
    const t1Id = store.t1FileId;

    if (!t0Id || !t1Id) {
      alert("Please upload both T0 and T1 frames before interpolating.");
      return;
    }

    store.setJobState({
      status: 'preparing',
      progress: 0,
      startedAt: new Date().toISOString(),
      outputFileId: null,
      error: undefined,
    });

    try {
      const res = await interpolationClient.generateInterpolation(t0Id, t1Id, store.config.variable || "C13");
      
      if (!res.success) throw new Error(res.message);

      const responseData = res.data as { job_id: string };
      const jobId = responseData.job_id;
      store.setJobState({ status: 'processing', jobId });

      const sseUrl = `${BASE_URL}/interpolation/events/${jobId}`;
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          store.setJobState({ status: 'error', error: data.error });
          eventSource.close();
          return;
        }

        store.setJobState({ 
          progress: data.progress, 
          status: data.status 
        });

        if (data.status === 'completed' || data.status === 'failed') {
          if (data.status === 'completed') {
            store.setJobState({
              outputFileId: data.result_file_id,
              completedAt: new Date().toISOString()
            });
            // Propagate to validation store
            if (data.result_file_id) {
              validationStore.setArtifactId(data.result_file_id);
            }
          }
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        console.error("SSE connection lost!");
        store.setJobState({ status: 'error', error: 'Connection to server lost. Still processing in cloud.' });
        eventSource.close();
      };

    } catch (error: unknown) {
      store.setJobState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate interpolation frame.',
        completedAt: new Date().toISOString(),
      });
    }
  };

  const resetJob = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    store.reset();
  };

  return {
    startInterpolation,
    resetJob,
  };
}